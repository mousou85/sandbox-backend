import {Injectable} from '@nestjs/common';
import dayjs from 'dayjs';
import {DataSource, FindOptionsWhere, QueryRunner} from 'typeorm';

import {InvestSummaryDateEntity, InvestSummaryEntity} from '@app/invest/entity';
import {EInvestSummaryDateType} from '@app/invest/invest.enum';
import {
  InvestHistoryRepository,
  InvestItemRepository,
  InvestSummaryDateRepository,
  InvestSummaryRepository,
  InvestUnitRepository,
} from '@app/invest/repository';
import {DataNotFoundException} from '@common/exception';
import {DateHelper, TDateType} from '@common/helper';

/**
 * 요약 데이터 insert/update 옵션
 */
interface IUpsertSummaryOptions {
  ignoreItemCheck: boolean;
  ignoreUnitCheck: boolean;
}

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
   * 전체 요약 데이터 반환
   * @param itemIdx
   * @param unit
   */
  async getTotalSummary(itemIdx: number, unit: string): Promise<InvestSummaryEntity> {
    return this.investSummaryRepository.findByCondition(
      {item_idx: itemIdx, unit: unit},
      {investUnit: true}
    );
  }

  /**
   * 월간/년간 요약 데이터 반환
   * @param itemIdx
   * @param unit
   * @param summaryDateType
   * @param summaryDate
   */
  async getDateSummary(
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
   * month summary delete
   * @param itemIdx
   * @param unitIdx
   * @param targetDate
   * @param queryRunner
   * @protected
   */
  protected async deleteMonthSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: TDateType,
    queryRunner?: QueryRunner
  ) {
    targetDate = DateHelper.format(targetDate, 'YYYY-MM-01');

    const criteria: FindOptionsWhere<InvestSummaryDateEntity> = {
      item_idx: itemIdx,
      unit_idx: unitIdx,
      summary_type: 'month',
      summary_date: targetDate,
    };

    queryRunner
      ? await queryRunner.manager.delete(InvestSummaryDateEntity, criteria)
      : await this.investSummaryDateRepository.delete(criteria);
  }

  /**
   * 모든 요약 데이터 insert/update
   * @param itemIdx
   * @param unitIdx
   * @param targetDate
   * @param queryRunner
   * @param opts
   */
  async upsertSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner,
    opts?: IUpsertSummaryOptions
  ) {
    //월간 요약 데이터 생성/갱신
    await this.upsertMonthSummary(itemIdx, unitIdx, targetDate, queryRunner, opts);
    await this.updateNextMonthSummary(itemIdx, unitIdx, targetDate, queryRunner, opts);

    //년간 요약 데이터 생성/갱신
    await this.upsertYearSummary(itemIdx, unitIdx, targetDate, queryRunner, opts);
    await this.updateNextYearSummary(itemIdx, unitIdx, targetDate, queryRunner, opts);

    //전체 요약 데이터 생성/갱신
    await this.upsertTotalSummary(itemIdx, unitIdx, queryRunner, opts);
  }

  /**
   * 월간 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   * @param opts
   */
  async upsertMonthSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner,
    opts?: IUpsertSummaryOptions
  ): Promise<void> {
    const entityManager = queryRunner ? queryRunner.manager : null;

    //상품 유무 체크
    if (!opts?.ignoreItemCheck) {
      const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
      if (!hasItem) throw new DataNotFoundException('invest item');
    }

    //단위 유무 체크
    if (!opts?.ignoreUnitCheck) {
      const hasUnit = await this.investUnitRepository.existsBy(
        {
          unit_idx: unitIdx,
          item_idx: itemIdx,
        },
        queryRunner
      );
      if (!hasUnit) throw new DataNotFoundException('invest unit');
    }

    //set vars: 날짜 관련
    const startDate = DateHelper.format(targetDate, 'YYYY-MM-01');
    const endDate = DateHelper.endOfMonth(startDate);
    const summaryDate = startDate;

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
    if (entityManager) {
      await entityManager.save(summaryDateEntity, {reload: false});
    } else {
      await this.investSummaryDateRepository.save(summaryDateEntity, {reload: false});
    }
  }

  /**
   * 이후 월간 요약 데이터 update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   * @param opts
   */
  async updateNextMonthSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner,
    opts?: IUpsertSummaryOptions
  ): Promise<void> {
    //상품 유무 체크
    if (!opts?.ignoreItemCheck) {
      const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
      if (!hasItem) throw new DataNotFoundException('invest item');
    }

    //단위 유무 체크
    if (!opts?.ignoreUnitCheck) {
      const hasUnit = await this.investUnitRepository.existsBy(
        {
          unit_idx: unitIdx,
          item_idx: itemIdx,
        },
        queryRunner
      );
      if (!hasUnit) throw new DataNotFoundException('invest unit');
    }

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
    const maxDate = dayjs(dateRange.maxDate);

    let loopDate = minDate;
    while (loopDate <= maxDate) {
      //월간 요약 데이터 갱신
      await this.upsertMonthSummary(itemIdx, unitIdx, loopDate.format('YYYY-MM-DD'), queryRunner);

      loopDate = loopDate.add(1, 'month');
    }
  }

  /**
   * 년간 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   * @param opts
   * @todo 상품 종료일 관련 추가 처리 필요
   */
  async upsertYearSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner,
    opts?: IUpsertSummaryOptions
  ): Promise<void> {
    const entityManager = queryRunner ? queryRunner.manager : null;

    //상품 유무 체크
    if (!opts?.ignoreItemCheck) {
      const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
      if (!hasItem) throw new DataNotFoundException('invest item');
    }

    //단위 유무 체크
    if (!opts?.ignoreUnitCheck) {
      const hasUnit = await this.investUnitRepository.existsBy(
        {
          unit_idx: unitIdx,
          item_idx: itemIdx,
        },
        queryRunner
      );
      if (!hasUnit) throw new DataNotFoundException('invest unit');
    }

    //set vars: 날짜 관련
    const startDate = DateHelper.format(targetDate, 'YYYY-01-01');
    const endDate = DateHelper.endOfYear(startDate);
    const summaryDate = startDate;

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
    if (entityManager) {
      await entityManager.save(summaryDateEntity, {reload: false});
    } else {
      await this.investSummaryDateRepository.save(summaryDateEntity, {reload: false});
    }
  }

  /**
   * 이후 년간 요약 데이터 update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param targetDate 대상 요약 일자
   * @param queryRunner 트랜잭션 사용시
   * @param opts
   */
  async updateNextYearSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner,
    opts?: IUpsertSummaryOptions
  ): Promise<void> {
    //상품 유무 체크
    if (!opts?.ignoreItemCheck) {
      const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
      if (!hasItem) throw new DataNotFoundException('invest item');
    }

    //단위 유무 체크
    if (!opts?.ignoreUnitCheck) {
      const hasUnit = await this.investUnitRepository.existsBy(
        {
          unit_idx: unitIdx,
          item_idx: itemIdx,
        },
        queryRunner
      );
      if (!hasUnit) throw new DataNotFoundException('invest unit');
    }

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

    for (let year = dateRange.minYear; year <= dateRange.maxYear; year++) {
      await this.upsertYearSummary(itemIdx, unitIdx, `${year}-01-01`, queryRunner);
    }
  }

  /**
   * 전체 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param queryRunner 트랜잭션 사용시
   * @param opts
   */
  async upsertTotalSummary(
    itemIdx: number,
    unitIdx: number,
    queryRunner?: QueryRunner,
    opts?: IUpsertSummaryOptions
  ): Promise<void> {
    const entityManager = queryRunner ? queryRunner.manager : null;

    //상품 유무 체크
    if (!opts?.ignoreItemCheck) {
      const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
      if (!hasItem) throw new DataNotFoundException('invest item');
    }

    //단위 유무 체크
    if (!opts?.ignoreUnitCheck) {
      const hasUnit = await this.investUnitRepository.existsBy(
        {
          unit_idx: unitIdx,
          item_idx: itemIdx,
        },
        queryRunner
      );
      if (!hasUnit) throw new DataNotFoundException('invest unit');
    }

    //set vars:  전체 요약 데이터(없으면 생성)
    let summaryEntity = await this.investSummaryRepository.findEntityAndReset(
      itemIdx,
      unitIdx,
      queryRunner
    );

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
      await entityManager.save(summaryEntity, {reload: false});
    } else {
      await this.investSummaryRepository.save(summaryEntity, {reload: false});
    }
  }

  /**
   * 요약 데이터 재생성
   * @param itemIdx
   */
  async remakeSummary(itemIdx: number) {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemRepository.findByCondition({item_idx: itemIdx});
    if (!itemEntity) throw new DataNotFoundException('invest item');

    //set vars: 상품 종료일(또는 만기일) - 해당월의 마지막일로 설정
    let itemCloseDate: dayjs.Dayjs = null;
    if (itemEntity.is_close == 'y' && itemEntity.closed_at) {
      itemCloseDate = dayjs(DateHelper.endOfMonth(itemEntity.closed_at));
    }

    //set vars: 단위 리스트
    const {list: unitList} = await this.investUnitRepository.findAllByCondition(
      {item_idx: itemIdx},
      {getAll: true}
    );

    //단위 별로 처리
    for (const unit of unitList) {
      const unitIdx = unit.unit_idx;

      //set vars: 요약 데이터 만들 기간 범위
      const dateRange = await this.investHistoryRepository
        .createQueryBuilder('history')
        .select([
          `DATE_FORMAT(MIN(history.history_date), '%Y-%m-01') AS minDate`,
          `DATE_FORMAT(MAX(history.history_date), '%Y-%m-01') AS maxDate`,
        ])
        .where('history.item_idx = :item_idx', {item_idx: itemIdx})
        .andWhere('history.unit_idx = :unit_idx', {unit_idx: unitIdx})
        .getRawOne();
      if (!dateRange || !dateRange.minDate || !dateRange.maxDate) continue;

      //set vars: 날짜 관련(month summary 관련)
      const summaryMinDate = dayjs(dateRange.minDate);
      let summaryMaxDate = dayjs(dateRange.maxDate);
      let targetSummaryDate = summaryMinDate.clone();
      let deleteSummaryMinDate: dayjs.Dayjs = null;
      let deleteSummaryMaxDate: dayjs.Dayjs = null;
      if (itemCloseDate && summaryMaxDate > itemCloseDate) {
        summaryMaxDate = itemCloseDate;
        deleteSummaryMinDate = itemCloseDate.add(1, 'month');
        deleteSummaryMaxDate = summaryMaxDate;
      }

      //set vars: 날짜 관련(year summary 관련)
      let summaryLastYear = summaryMinDate.year();
      const summaryYears = [summaryLastYear];

      //트랜잭션 처리
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        /*
         * month summary insert/update
         * - 기간 범위를 1달 단위로 반복하여 처리
         * - year summary insert/update용 years 배열에 값 할당
         */
        while (targetSummaryDate <= summaryMaxDate) {
          //month summary insert/update
          await this.upsertMonthSummary(
            itemIdx,
            unitIdx,
            targetSummaryDate.format('YYYY-MM-DD'),
            queryRunner,
            {ignoreUnitCheck: true, ignoreItemCheck: true}
          );

          //대상 날짜 1달 증가 및 대상 년도 목록에 년도 추가
          targetSummaryDate = targetSummaryDate.add(1, 'month');
          if (summaryLastYear != targetSummaryDate.year()) {
            summaryLastYear = targetSummaryDate.year();
            summaryYears.push(summaryLastYear);
          }
        }

        /*
         * @todo 코드 분리 필요
         * month summary delete
         * - itemCloseDate가 있으면 해당 일자 이후 summary 삭제
         */
        if (deleteSummaryMinDate && deleteSummaryMaxDate) {
          while (deleteSummaryMinDate <= deleteSummaryMaxDate) {
            await this.deleteMonthSummary(itemIdx, unitIdx, deleteSummaryMinDate, queryRunner);

            deleteSummaryMinDate = deleteSummaryMinDate.add(1, 'month');
          }
        }

        //년간 요약 데이터 insert/update
        for (const year of summaryYears) {
          await this.upsertYearSummary(itemIdx, unitIdx, `${year}-12-01`, queryRunner, {
            ignoreUnitCheck: true,
            ignoreItemCheck: true,
          });
        }

        //전체 요약 데이터 insert/update
        await this.upsertTotalSummary(itemIdx, unitIdx, queryRunner, {
          ignoreUnitCheck: true,
          ignoreItemCheck: true,
        });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
  }
}
