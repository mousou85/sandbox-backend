import {Injectable} from '@nestjs/common';
import {DataSource, QueryRunner} from 'typeorm';

import {DataNotFoundException} from '@common/exception';
import {DateHelper} from '@common/helper';
import {InvestSummaryDateEntity, InvestSummaryEntity} from '@db/entity';
import {
  InvestHistoryRepository,
  InvestItemRepository,
  InvestSummaryDateRepository,
  InvestSummaryRepository,
  InvestUnitRepository,
} from '@db/repository';

@Injectable()
export class InvestSummaryService {
  constructor(
    protected dataSource: DataSource,
    protected investSummaryRepository: InvestSummaryRepository,
    protected investSummaryDateRepository: InvestSummaryDateRepository,
    protected investItemRepository: InvestItemRepository,
    protected investUnitRepository: InvestUnitRepository,
    protected investHistoryRepository: InvestHistoryRepository
  ) {}

  /**
   * 년간/월간 요약 데이터의 항목중 재계산 필요한 항목 재계산
   * @param entity
   * @param prevData
   * @protected
   */
  protected recalculateDateSummary(
    entity: InvestSummaryDateEntity,
    prevData: {
      prevEarn: number;
      prevEarnIncProceeds: number;
      prevEarnRate: number;
      prevEarnRateIncProceeds: number;
    }
  ): InvestSummaryDateEntity {
    const {prevEarn, prevEarnIncProceeds, prevEarnRate, prevEarnRateIncProceeds} = prevData;

    //유입/유출/평가 총합 계산
    entity.inout_total = entity.inout_principal_total + entity.inout_proceeds_total;
    entity.revenue_total = entity.revenue_interest_total + entity.revenue_eval;

    //수익율/수익금 계산
    entity.earn = entity.revenue_interest_total;
    entity.earn_inc_proceeds = entity.revenue_interest_total;
    if (entity.revenue_eval != 0) {
      entity.earn += entity.revenue_eval - entity.inout_principal_total;
      entity.earn_inc_proceeds += entity.revenue_eval - entity.inout_total;
    }
    if (entity.inout_principal_total != 0 && entity.earn != 0) {
      entity.earn_rate = entity.earn / entity.inout_principal_total;
    }
    if (entity.inout_total != 0 && entity.earn_inc_proceeds != 0) {
      entity.earn_rate_inc_proceeds = entity.earn_inc_proceeds / entity.inout_total;
    }

    // 이전 데이터 대비 수익율/수익금 계산
    entity.earn_prev_diff = entity.earn;
    entity.earn_inc_proceeds_prev_diff = entity.earn_inc_proceeds;
    if (prevEarn != 0) entity.earn_prev_diff -= prevEarn;
    if (prevEarnIncProceeds != 0) entity.earn_inc_proceeds_prev_diff -= prevEarnIncProceeds;
    if (prevEarnRate != 0) entity.earn_rate_prev_diff = entity.earn_rate - prevEarnRate;
    if (prevEarnRateIncProceeds != 0) {
      entity.earn_rate_inc_proceeds_prev_diff =
        entity.earn_rate_inc_proceeds - prevEarnRateIncProceeds;
    }

    return entity;
  }

  /**
   * 월간 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param historyDate 요약 일자
   * @param unitIdx 단위 idx
   * @param queryRunner 트랜잭션 사용시
   */
  async upsertMonthSummary(
    itemIdx: number,
    historyDate: string,
    unitIdx: number,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryDateEntity> {
    const entityManager = queryRunner ? queryRunner.manager : null;

    //상품 유무 체크
    const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
    if (!hasItem) throw new DataNotFoundException('invest item');

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {
        unit_idx: unitIdx,
        item_idx: itemIdx,
      },
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars: 날짜 관련
    const startDate = DateHelper.format(historyDate, 'YYYY-MM-01');
    const endDate = DateHelper.endOfMonth(startDate);
    const summaryDate = startDate;

    //set vars: 이번달 요약 데이터(없으면 생성)
    let summaryDateEntity = entityManager
      ? await entityManager.findOneBy<InvestSummaryDateEntity>(InvestSummaryDateEntity, {
          summary_date: summaryDate,
          item_idx: itemIdx,
          summary_type: 'month',
          unit_idx: unitIdx,
        })
      : await this.investSummaryDateRepository.findOneBy({
          summary_date: summaryDate,
          item_idx: itemIdx,
          summary_type: 'month',
          unit_idx: unitIdx,
        });
    if (!summaryDateEntity) {
      summaryDateEntity = this.investSummaryDateRepository.newEntity(
        itemIdx,
        unitIdx,
        summaryDate,
        'month'
      );
    }

    //set vars: 이전달 요약 데이터
    const prevSummaryDateEntity = await this.investSummaryDateRepository.findPrevMonthData(
      itemIdx,
      unitIdx,
      summaryDate,
      queryRunner
    );

    //이번달 요약 데이터에 이전달 요약 데이터 값 할당
    let prevEarn = 0;
    let prevEarnIncProceeds = 0;
    let prevEarnRate = 0;
    let prevEarnRateIncProceeds = 0;
    if (prevSummaryDateEntity) {
      prevEarn = prevSummaryDateEntity.earn;
      prevEarnIncProceeds = prevSummaryDateEntity.earn_inc_proceeds;
      prevEarnRate = prevSummaryDateEntity.earn_rate;
      prevEarnRateIncProceeds = prevSummaryDateEntity.earn_rate_inc_proceeds;

      summaryDateEntity.inout_principal_prev = prevSummaryDateEntity.inout_principal_total;
      summaryDateEntity.inout_principal_total += prevSummaryDateEntity.inout_principal_total;

      summaryDateEntity.inout_proceeds_prev = prevSummaryDateEntity.inout_proceeds_total;
      summaryDateEntity.inout_proceeds_total += prevSummaryDateEntity.inout_proceeds_total;

      summaryDateEntity.revenue_interest_prev = prevSummaryDateEntity.revenue_interest_total;
      summaryDateEntity.revenue_interest_total += prevSummaryDateEntity.revenue_interest_total;

      summaryDateEntity.revenue_eval_prev = prevSummaryDateEntity.revenue_eval;
    }

    //set vars: 유입/유출/평가(이자) 요약 데이터
    const historySummary1 = await this.investHistoryRepository.findInoutInterestSummary(
      itemIdx,
      unitIdx,
      {begin: startDate, end: endDate},
      queryRunner
    );

    //생성할 요약 데이터에 가져온 데이터 저장
    for (const item of historySummary1) {
      if (item.history_type == 'inout') {
        if (item.val_type == 'principal') {
          summaryDateEntity.inout_principal_current = item.total_val;
          summaryDateEntity.inout_principal_total += item.total_val;
        } else {
          summaryDateEntity.inout_proceeds_current = item.total_val;
          summaryDateEntity.inout_proceeds_total += item.total_val;
        }
      } else {
        summaryDateEntity.revenue_interest_current = item.total_val;
        summaryDateEntity.revenue_interest_total += item.total_val;
      }
    }

    //set vars: 평가(평가금액) 요약 데이터
    const historySummary2 = await this.investHistoryRepository.findRevenueEvalSummary(
      itemIdx,
      unitIdx,
      endDate,
      queryRunner
    );

    //생성할 요약 데이터에 가져온 데이터 저장
    if (historySummary2) summaryDateEntity.revenue_eval = historySummary2.val;

    //재계산 필요 항목 재계산 처리
    summaryDateEntity = this.recalculateDateSummary(summaryDateEntity, {
      prevEarn: prevEarn,
      prevEarnIncProceeds: prevEarnIncProceeds,
      prevEarnRate: prevEarnRate,
      prevEarnRateIncProceeds: prevEarnRateIncProceeds,
    });

    //이번달 요약 데이터 insert/update
    if (entityManager) {
      await entityManager.save(summaryDateEntity);
    } else {
      await this.investSummaryDateRepository.save(summaryDateEntity);
    }

    return summaryDateEntity;
  }

  /**
   * 년간 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param historyDate 요약 일자
   * @param unitIdx 단위 idx
   * @param queryRunner 트랜잭션 사용시
   */
  async upsertYearSummary(
    itemIdx: number,
    historyDate: string,
    unitIdx: number,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryDateEntity> {
    const entityManager = queryRunner ? queryRunner.manager : null;

    //상품 유무 체크
    const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
    if (!hasItem) throw new DataNotFoundException('invest item');

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {
        unit_idx: unitIdx,
        item_idx: itemIdx,
      },
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars: 날짜 관련
    const startDate = DateHelper.format(historyDate, 'YYYY-01-01');
    const endDate = DateHelper.endOfYear(startDate);
    const summaryDate = startDate;

    //set vars: 이번년도 요약 데이터(없으면 생성)
    let summaryDateEntity = entityManager
      ? await entityManager.findOneBy<InvestSummaryDateEntity>(InvestSummaryDateEntity, {
          summary_date: summaryDate,
          item_idx: itemIdx,
          summary_type: 'year',
          unit_idx: unitIdx,
        })
      : await this.investSummaryDateRepository.findOneBy({
          summary_date: summaryDate,
          item_idx: itemIdx,
          summary_type: 'year',
          unit_idx: unitIdx,
        });
    if (!summaryDateEntity) {
      summaryDateEntity = this.investSummaryDateRepository.newEntity(
        itemIdx,
        unitIdx,
        summaryDate,
        'year'
      );
    }

    //set vars: 이전년도 요약 데이터
    const prevSummaryDateEntity = await this.investSummaryDateRepository.findPrevYearData(
      itemIdx,
      unitIdx,
      summaryDate,
      queryRunner
    );

    //이번년도 요약 데이터에 이전년도 요약 데이터 값 할당
    let prevEarn = 0;
    let prevEarnIncProceeds = 0;
    let prevEarnRate = 0;
    let prevEarnRateIncProceeds = 0;
    if (prevSummaryDateEntity) {
      prevEarn = prevSummaryDateEntity.earn;
      prevEarnIncProceeds = prevSummaryDateEntity.earn_inc_proceeds;
      prevEarnRate = prevSummaryDateEntity.earn_rate;
      prevEarnRateIncProceeds = prevSummaryDateEntity.earn_rate_inc_proceeds;

      summaryDateEntity.inout_principal_prev = prevSummaryDateEntity.inout_principal_total;
      summaryDateEntity.inout_principal_total += prevSummaryDateEntity.inout_principal_total;

      summaryDateEntity.inout_proceeds_prev = prevSummaryDateEntity.inout_proceeds_total;
      summaryDateEntity.inout_proceeds_total += prevSummaryDateEntity.inout_proceeds_total;

      summaryDateEntity.revenue_interest_prev = prevSummaryDateEntity.revenue_interest_total;
      summaryDateEntity.revenue_interest_total += prevSummaryDateEntity.revenue_interest_total;

      summaryDateEntity.revenue_eval_prev = prevSummaryDateEntity.revenue_eval;
    }

    //set vars: 유입/유출/평가(이자) 요약 데이터
    const historySummary1 = await this.investSummaryDateRepository.findInoutInterestSummary(
      itemIdx,
      unitIdx,
      {begin: startDate, end: endDate},
      queryRunner
    );

    //생성할 요약 데이터에 가져온 데이터 저장
    if (historySummary1) {
      summaryDateEntity.inout_principal_current = historySummary1.inout_principal_current;
      summaryDateEntity.inout_principal_total += historySummary1.inout_principal_current;

      summaryDateEntity.inout_proceeds_current = historySummary1.inout_proceeds_current;
      summaryDateEntity.inout_proceeds_total += historySummary1.inout_proceeds_current;

      summaryDateEntity.revenue_interest_current = historySummary1.revenue_interest_current;
      summaryDateEntity.revenue_interest_total += historySummary1.revenue_interest_current;
    }

    //set vars: 평가(평가금액) 요약 데이터
    const historySummary2 = await this.investSummaryDateRepository.findRevenueEvalSummary(
      itemIdx,
      unitIdx,
      {begin: startDate, end: endDate},
      queryRunner
    );

    //생성할 요약 데이터에 가져온 데이터 저장
    if (historySummary2) summaryDateEntity.revenue_eval = historySummary2.val;

    //재계산 필요 항목 재계산 처리
    summaryDateEntity = this.recalculateDateSummary(summaryDateEntity, {
      prevEarn: prevEarn,
      prevEarnIncProceeds: prevEarnIncProceeds,
      prevEarnRate: prevEarnRate,
      prevEarnRateIncProceeds: prevEarnRateIncProceeds,
    });

    //이번달 요약 데이터 insert/update
    if (entityManager) {
      await entityManager.save(summaryDateEntity);
    } else {
      await this.investSummaryDateRepository.save(summaryDateEntity);
    }

    return summaryDateEntity;
  }

  /**
   * 전체 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param queryRunner 트랜잭션 사용시
   */
  async upsertTotalSummary(
    itemIdx: number,
    unitIdx: number,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryEntity> {
    const entityManager = queryRunner ? queryRunner.manager : null;

    //상품 유무 체크
    const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
    if (!hasItem) throw new DataNotFoundException('invest item');

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {
        unit_idx: unitIdx,
        item_idx: itemIdx,
      },
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars:  전체 요약 데이터(없으면 생성)
    let summaryEntity = entityManager
      ? await entityManager.findOneBy<InvestSummaryEntity>(InvestSummaryEntity, {
          item_idx: itemIdx,
          unit_idx: unitIdx,
        })
      : await this.investSummaryRepository.findByCondition({item_idx: itemIdx, unit_idx: unitIdx});
    if (!summaryEntity) {
      summaryEntity = new InvestSummaryEntity();
      summaryEntity.item_idx = itemIdx;
      summaryEntity.unit_idx = unitIdx;
    }

    //set vars: 년간 요약 데이터
    const summaryDateEntity = entityManager
      ? await entityManager.findOne<InvestSummaryDateEntity>(InvestSummaryDateEntity, {
          where: {
            item_idx: itemIdx,
            summary_type: 'year',
            unit_idx: unitIdx,
          },
          order: {
            summary_date: 'DESC',
          },
        })
      : await this.investSummaryDateRepository.findOne({
          where: {
            item_idx: itemIdx,
            summary_type: 'year',
            unit_idx: unitIdx,
          },
          order: {
            summary_date: 'DESC',
          },
        });

    //년간 요약 데이터 있으면 전체 요약 데이터 값 갱신
    if (summaryDateEntity) {
      summaryEntity.inout_total = summaryDateEntity.inout_total;
      summaryEntity.inout_principal = summaryDateEntity.inout_principal_total;
      summaryEntity.inout_proceeds = summaryDateEntity.inout_proceeds_total;

      summaryEntity.revenue_total = summaryDateEntity.revenue_total;
      summaryEntity.revenue_interest = summaryDateEntity.revenue_interest_total;
      summaryEntity.revenue_eval = summaryDateEntity.revenue_eval;

      summaryEntity.earn = summaryDateEntity.earn;
      summaryEntity.earn_rate = summaryDateEntity.earn_rate;
      summaryEntity.earn_inc_proceeds = summaryDateEntity.earn_inc_proceeds;
      summaryEntity.earn_rate_inc_proceeds = summaryDateEntity.earn_rate_inc_proceeds;
    }

    //전체 요약 데이터 insert/update
    if (entityManager) {
      await entityManager.save(summaryEntity);
    } else {
      await this.investSummaryRepository.save(summaryEntity);
    }

    return summaryEntity;
  }
}
