import {Injectable} from '@nestjs/common';
import dayjs from 'dayjs';
import {DataSource, QueryRunner} from 'typeorm';

import {InvestSummaryDateEntity, InvestSummaryEntity} from '@app/invest/entity';
import {
  InvestHistoryRepository,
  InvestItemRepository,
  InvestSummaryDateRepository,
  InvestSummaryRepository,
  InvestUnitRepository,
} from '@app/invest/repository';
import {DataNotFoundException} from '@common/exception';

import {InvestSummaryDateService} from './investSummaryDate.service';

@Injectable()
export class InvestSummaryService {
  constructor(
    protected dataSource: DataSource,
    protected investSummaryRepository: InvestSummaryRepository,
    protected investSummaryDateRepository: InvestSummaryDateRepository,
    protected investItemRepository: InvestItemRepository,
    protected investUnitRepository: InvestUnitRepository,
    protected investHistoryRepository: InvestHistoryRepository,
    protected investSummaryDateService: InvestSummaryDateService
  ) {}

  /**
   * 전체 요약 데이터 반환
   * @param itemIdx
   * @param unit
   */
  async getSummary(itemIdx: number, unit: string): Promise<InvestSummaryEntity> {
    return this.investSummaryRepository.findByCondition(
      {item_idx: itemIdx, unit: unit},
      {investUnit: true}
    );
  }

  /**
   * 모든 요약 데이터 insert/update
   * @param itemIdx
   * @param unitIdx
   * @param targetDate
   * @param queryRunner
   */
  async upsertAllSummary(
    itemIdx: number,
    unitIdx: number,
    targetDate: string,
    queryRunner?: QueryRunner
  ) {
    //월간 요약 데이터 생성/갱신
    await this.investSummaryDateService.upsertMonthSummary(
      itemIdx,
      unitIdx,
      targetDate,
      queryRunner
    );
    await this.investSummaryDateService.updateNextMonthSummary(
      itemIdx,
      unitIdx,
      targetDate,
      queryRunner
    );

    //년간 요약 데이터 생성/갱신
    await this.investSummaryDateService.upsertYearSummary(
      itemIdx,
      unitIdx,
      targetDate,
      queryRunner
    );
    await this.investSummaryDateService.updateNextYearSummary(
      itemIdx,
      unitIdx,
      targetDate,
      queryRunner
    );

    //전체 요약 데이터 생성/갱신
    await this.upsertSummary(itemIdx, unitIdx, queryRunner);
  }

  /**
   * 전체 요약 데이터 insert/update
   * @param itemIdx 상품 idx
   * @param unitIdx 단위 idx
   * @param queryRunner 트랜잭션 사용시
   */
  async upsertSummary(itemIdx: number, unitIdx: number, queryRunner?: QueryRunner): Promise<void> {
    //상품 유무 체크
    const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
    if (!hasItem) throw new DataNotFoundException('invest item');

    //단위 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy(
      {unit_idx: unitIdx, item_idx: itemIdx},
      queryRunner
    );
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars:  전체 요약 데이터(없으면 생성)
    let summaryEntity = await this.investSummaryRepository.findEntityAndReset(
      itemIdx,
      unitIdx,
      queryRunner
    );

    //set vars: 년간 요약 데이터
    const summaryDateEntity = queryRunner
      ? await queryRunner.manager.findOne(InvestSummaryDateEntity, {
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
    queryRunner
      ? await queryRunner.manager.save(summaryEntity, {reload: false})
      : await this.investSummaryRepository.save(summaryEntity, {reload: false});
  }

  /**
   * 모든 요약 데이터 재생성
   * @param itemIdx
   */
  async remakeSummary(itemIdx: number) {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemRepository.findByCondition({item_idx: itemIdx});
    if (!itemEntity) throw new DataNotFoundException('invest item');

    //set vars: 상품 종료일(또는 만기일)
    const itemCloseDate: dayjs.Dayjs = itemEntity.closed_at ? dayjs(itemEntity.closed_at) : null;

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
      if (itemCloseDate && summaryMaxDate > itemCloseDate) {
        summaryMaxDate = itemCloseDate;
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
          await this.investSummaryDateService.upsertMonthSummary(
            itemIdx,
            unitIdx,
            targetSummaryDate.format('YYYY-MM-DD'),
            queryRunner
          );

          //대상 날짜 1달 증가 및 대상 년도 목록에 년도 추가
          targetSummaryDate = targetSummaryDate.add(1, 'month');
          if (summaryLastYear != targetSummaryDate.year()) {
            summaryLastYear = targetSummaryDate.year();
            summaryYears.push(summaryLastYear);
          }
        }

        //불필요한 month summary 삭제
        await this.investSummaryDateService.deleteUnnecessarySummary(itemIdx, 'month', queryRunner);

        //년간 요약 데이터 insert/update
        for (const year of summaryYears) {
          await this.investSummaryDateService.upsertYearSummary(
            itemIdx,
            unitIdx,
            `${year}-12-01`,
            queryRunner
          );
        }

        //불필요한 year summary 삭제
        await this.investSummaryDateService.deleteUnnecessarySummary(itemIdx, 'year', queryRunner);

        //전체 요약 데이터 insert/update
        await this.upsertSummary(itemIdx, unitIdx, queryRunner);

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
