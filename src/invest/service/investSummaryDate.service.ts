import {Injectable} from '@nestjs/common';
import dayjs from 'dayjs';
import {DataSource, FindOptionsWhere, MoreThan, QueryRunner} from 'typeorm';

import {InvestSummaryDateEntity} from '@app/invest/entity';
import {EInvestSummaryDateType} from '@app/invest/invest.enum';
import {
  InvestHistoryRepository,
  InvestItemRepository,
  InvestSummaryDateRepository,
  InvestUnitRepository,
} from '@app/invest/repository';
import {DataNotFoundException} from '@common/exception';
import {DateHelper} from '@common/helper';

@Injectable()
export class InvestSummaryDateService {
  constructor(
    protected dataSource: DataSource,
    protected investSummaryDateRepository: InvestSummaryDateRepository,
    protected investItemRepository: InvestItemRepository,
    protected investUnitRepository: InvestUnitRepository,
    protected investHistoryRepository: InvestHistoryRepository
  ) {}

  /**
   * 년간/월간 요약 데이터의 항목중 재계산 필요한 항목 재계산
   * @param entity
   * @param prevSummaryEntity
   * @protected
   */
  protected recalculateDateSummary(
    entity: InvestSummaryDateEntity,
    prevSummaryEntity: InvestSummaryDateEntity
  ): InvestSummaryDateEntity {
    //이전 요약 데이터가 있으면 현재 요약 데이터 값 할당
    if (prevSummaryEntity) {
      entity.inout_principal_prev = prevSummaryEntity.inout_principal_total;
      entity.inout_principal_total += prevSummaryEntity.inout_principal_total;

      entity.inout_proceeds_prev = prevSummaryEntity.inout_proceeds_total;
      entity.inout_proceeds_total += prevSummaryEntity.inout_proceeds_total;

      entity.revenue_interest_prev = prevSummaryEntity.revenue_interest_total;
      entity.revenue_interest_total += prevSummaryEntity.revenue_interest_total;

      entity.revenue_eval_prev = prevSummaryEntity.revenue_eval;
    }

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
    if (prevSummaryEntity) {
      if (prevSummaryEntity.earn != 0) {
        entity.earn_prev_diff -= prevSummaryEntity.earn;
      }
      if (prevSummaryEntity.earn_inc_proceeds != 0) {
        entity.earn_inc_proceeds_prev_diff -= prevSummaryEntity.earn_inc_proceeds;
      }
      if (prevSummaryEntity.earn_rate != 0) {
        entity.earn_rate_prev_diff = entity.earn_rate - prevSummaryEntity.earn_rate;
      }
      if (prevSummaryEntity.earn_rate_inc_proceeds != 0) {
        entity.earn_rate_inc_proceeds_prev_diff =
          entity.earn_rate_inc_proceeds - prevSummaryEntity.earn_rate_inc_proceeds;
      }
    }

    return entity;
  }

  /**
   * 월간/년간 요약 데이터 반환
   * @param itemIdx
   * @param unit
   * @param summaryDateType
   * @param summaryDate
   */
  async getSummary(
    itemIdx: number,
    unit: string,
    summaryDateType: EInvestSummaryDateType,
    summaryDate: string
  ): Promise<InvestSummaryDateEntity> {
    return this.investSummaryDateRepository.findByCondition(
      {
        item_idx: itemIdx,
        unit: unit,
        summary_type: summaryDateType,
        summary_date: {value: summaryDate, op: '='},
      },
      {investUnit: true}
    );
  }

  /**
   * 월간 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   */
  async upsertMonthSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner
  ): Promise<void> {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemRepository.findByCondition(
      {item_idx: itemIdx},
      null,
      queryRunner
    );
    if (!itemEntity) throw new DataNotFoundException('invest item');

    //set vars: 상품 종료일(또는 만기일)
    const itemCloseAt: dayjs.Dayjs = itemEntity.closed_at ? dayjs(itemEntity.closed_at) : null;

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {unit_idx: unitIdx, item_idx: itemIdx},
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars: 날짜 관련
    const startDate = DateHelper.format(targetDate, 'YYYY-MM-01');
    const endDate = DateHelper.endOfMonth(startDate);
    const summaryDate = startDate;

    //상품 종료일보다 이후면 month summary 안 만듬
    if (itemCloseAt && dayjs(summaryDate) > itemCloseAt) return;

    //set vars: 이번달 요약 데이터(없으면 생성)
    let summaryDateEntity = await this.investSummaryDateRepository.findEntityAndReset(
      itemIdx,
      unitIdx,
      summaryDate,
      'month',
      queryRunner
    );

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

    //set vars: 이전달 요약 데이터
    const prevSummaryDateEntity = await this.investSummaryDateRepository.findPrevMonthData(
      itemIdx,
      unitIdx,
      summaryDate,
      queryRunner
    );

    //재계산 필요 항목 재계산 처리
    summaryDateEntity = this.recalculateDateSummary(summaryDateEntity, prevSummaryDateEntity);

    //이번달 요약 데이터 insert/update
    queryRunner
      ? await queryRunner.manager.save(summaryDateEntity, {reload: false})
      : await this.investSummaryDateRepository.save(summaryDateEntity, {reload: false});
  }

  /**
   * 이후 월간 요약 데이터 update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   */
  async updateNextMonthSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner
  ): Promise<void> {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemRepository.findByCondition(
      {item_idx: itemIdx},
      null,
      queryRunner
    );
    if (!itemEntity) throw new DataNotFoundException('invest item');

    //set vars: 상품 종료일(또는 만기일)
    const itemCloseAt: dayjs.Dayjs = itemEntity.closed_at ? dayjs(itemEntity.closed_at) : null;

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {unit_idx: unitIdx, item_idx: itemIdx},
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars: 날짜 관련
    const summaryDate = DateHelper.format(targetDate, 'YYYY-MM-01');

    //set vars: 대상이 될 요약 데이터 기간 범위
    const dateRange = await this.investSummaryDateRepository.findMonthSummaryDateRange(
      itemIdx,
      unitIdx,
      summaryDate,
      queryRunner
    );
    if (!dateRange || !dateRange.minDate || !dateRange.maxDate) return;

    const minDate = dayjs(dateRange.minDate);
    let maxDate = dayjs(dateRange.maxDate);
    if (itemCloseAt && maxDate > itemCloseAt) maxDate = itemCloseAt;

    //month summary insert/update
    let loopDate = minDate.clone();
    while (loopDate <= maxDate) {
      //월간 요약 데이터 갱신
      await this.upsertMonthSummary(itemIdx, unitIdx, loopDate.format('YYYY-MM-DD'), queryRunner);

      loopDate = loopDate.add(1, 'month');
    }

    //불필요한 요약 데이터 삭제
    await this.deleteUnnecessarySummary(itemIdx, 'month', queryRunner);
  }

  /**
   * 년간 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   */
  async upsertYearSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner
  ): Promise<void> {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemRepository.findByCondition(
      {item_idx: itemIdx},
      null,
      queryRunner
    );
    if (!itemEntity) throw new DataNotFoundException('invest item');

    //set vars: 상품 종료일(또는 만기일)
    const itemCloseAt: dayjs.Dayjs = itemEntity.closed_at ? dayjs(itemEntity.closed_at) : null;

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {unit_idx: unitIdx, item_idx: itemIdx},
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars: 날짜 관련
    const startDate = DateHelper.format(targetDate, 'YYYY-01-01');
    const endDate = DateHelper.endOfYear(startDate);
    const summaryDate = startDate;

    //상품 종료일보다 이후면 year summary 안 만듬
    if (itemCloseAt && dayjs(summaryDate) > itemCloseAt) return;

    //set vars: 이번년도 요약 데이터(없으면 생성)
    let summaryDateEntity = await this.investSummaryDateRepository.findEntityAndReset(
      itemIdx,
      unitIdx,
      summaryDate,
      'year',
      queryRunner
    );

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

    //set vars: 이전년도 요약 데이터
    const prevSummaryDateEntity = await this.investSummaryDateRepository.findPrevYearData(
      itemIdx,
      unitIdx,
      summaryDate,
      queryRunner
    );

    //재계산 필요 항목 재계산 처리
    summaryDateEntity = this.recalculateDateSummary(summaryDateEntity, prevSummaryDateEntity);

    //이번달 요약 데이터 insert/update
    queryRunner
      ? await queryRunner.manager.save(summaryDateEntity, {reload: false})
      : await this.investSummaryDateRepository.save(summaryDateEntity, {reload: false});
  }

  /**
   * 이후 년간 요약 데이터 update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   */
  async updateNextYearSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner
  ): Promise<void> {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemRepository.findByCondition(
      {item_idx: itemIdx},
      null,
      queryRunner
    );
    if (!itemEntity) throw new DataNotFoundException('invest item');

    //set vars: 상품 종료일(또는 만기일)
    const itemCloseAt: dayjs.Dayjs = itemEntity.closed_at ? dayjs(itemEntity.closed_at) : null;

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {unit_idx: unitIdx, item_idx: itemIdx},
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars: 날짜 관련
    const summaryDate = DateHelper.format(targetDate, 'YYYY-01-01');

    //set vars: 대상이 년간 요약 데이터 기간 범위
    const dateRange = await this.investSummaryDateRepository.findYearSummaryDateRange(
      itemIdx,
      unitIdx,
      summaryDate,
      queryRunner
    );
    if (!dateRange || !dateRange.minYear || !dateRange.maxYear) return;

    const minYear = dateRange.minYear;
    let maxYear = dateRange.maxYear;
    if (itemCloseAt && maxYear > itemCloseAt.year()) maxYear = itemCloseAt.year();

    //year summary insert/update
    for (let year = minYear; year <= maxYear; year++) {
      await this.upsertYearSummary(itemIdx, unitIdx, `${year}-01-01`, queryRunner);
    }

    //불필요한 요약 데이터 삭제
    await this.deleteUnnecessarySummary(itemIdx, 'year', queryRunner);
  }

  /**
   * 불필요한 summary 데이터 삭제
   * @param itemIdx
   * @param type
   * @param queryRunner
   */
  async deleteUnnecessarySummary(
    itemIdx: number,
    type: 'year' | 'month',
    queryRunner?: QueryRunner
  ) {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemRepository.findByCondition(
      {item_idx: itemIdx},
      null,
      queryRunner
    );
    if (!itemEntity) throw new DataNotFoundException('invest item');
    if (!itemEntity.closed_at) return;

    //set vars: 상품종료일(만기일)
    const closedAt = dayjs(itemEntity.closed_at);

    //summary 삭제
    let criteria: FindOptionsWhere<InvestSummaryDateEntity>;
    if (type == 'year') {
      criteria = {
        summary_date: MoreThan(DateHelper.endOfYear(closedAt)),
        item_idx: itemIdx,
        summary_type: 'year',
      };
    } else {
      criteria = {
        summary_date: MoreThan(closedAt.format('YYYY-MM-DD')),
        item_idx: itemIdx,
        summary_type: 'month',
      };
    }

    queryRunner
      ? await queryRunner.manager.delete(InvestSummaryDateEntity, criteria)
      : await this.investSummaryDateRepository.delete(criteria);
  }
}
