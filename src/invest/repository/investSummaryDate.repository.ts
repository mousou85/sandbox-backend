import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {LessThan, QueryRunner, Repository, SelectQueryBuilder} from 'typeorm';

import {InvestSummaryDateEntity} from '@app/invest/entity';
import {EInvestSummaryDateType} from '@app/invest/invest.enum';
import {
  BaseRepository,
  IFindAllResult,
  IQueryDateCondition,
  IQueryDateRangeCondition,
  IQueryListOption,
} from '@common/db';
import {DateHelper, TypeOrmHelper} from '@common/helper';

export interface IInvestSummaryDateCondition {
  item_idx?: number;
  unit?: string;
  unit_idx?: number;
  summary_date?: IQueryDateCondition | IQueryDateRangeCondition;
  summary_type?: EInvestSummaryDateType;
}

export interface IInvestSummaryDateJoinOption {
  investItem?: boolean;
  investUnit?: boolean;
}

@Injectable()
export class InvestSummaryDateRepository extends BaseRepository<InvestSummaryDateEntity> {
  constructor(
    @InjectRepository(InvestSummaryDateEntity)
    protected repository: Repository<InvestSummaryDateEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder(joinOption?: IInvestSummaryDateJoinOption, queryRunner?: QueryRunner) {
    const builder = this.repository.createQueryBuilder('summaryDate', queryRunner);
    if (joinOption?.investItem) {
      builder.innerJoinAndSelect('summaryDate.investItem', 'item');
    }
    joinOption?.investUnit
      ? builder.innerJoinAndSelect('summaryDate.investUnit', 'unit')
      : builder.innerJoin('summaryDate.investUnit', 'unit');

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestSummaryDateEntity>,
    condition: IInvestSummaryDateCondition
  ) {
    const {unit, item_idx, unit_idx, summary_type, summary_date} = condition;

    if (summary_date) {
      TypeOrmHelper.addDateCondition(queryBuilder, 'summaryDate.summary_date', summary_date, {
        paramName: 'summary_date',
        operator: 'and',
      });
    }
    if (item_idx) {
      queryBuilder.andWhere('summaryDate.item_idx = :item_idx', {item_idx});
    }
    if (summary_type) {
      queryBuilder.andWhere('summaryDate.summary_type = :summary_type', {summary_type});
    }
    if (unit_idx) {
      queryBuilder.andWhere('summaryDate.unit_idx = :unit_idx', {unit_idx});
    }
    if (unit) {
      queryBuilder.andWhere('unit.unit = :unit', {unit});
    }

    return queryBuilder;
  }

  async existsBy(
    condition: IInvestSummaryDateCondition,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    return super.existsBy(condition, queryRunner);
  }

  async countByCondition(
    condition: IInvestSummaryDateCondition,
    queryRunner?: QueryRunner
  ): Promise<number> {
    return super.countByCondition(condition, queryRunner);
  }

  async findByCondition(
    condition: IInvestSummaryDateCondition,
    joinOption?: IInvestSummaryDateJoinOption,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryDateEntity | null> {
    return super.findByCondition(condition, joinOption, queryRunner);
  }

  async findAllByCondition(
    condition: IInvestSummaryDateCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestSummaryDateJoinOption,
    queryRunner?: QueryRunner
  ): Promise<IFindAllResult<InvestSummaryDateEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption, queryRunner);
  }

  /**
   * entity를 초기화해서 반환
   * @param itemIdx
   * @param unitIdx
   * @param summaryDate
   * @param summaryType
   * @param queryRunner
   */
  async findEntityAndReset(
    itemIdx: number,
    unitIdx: number,
    summaryDate: string,
    summaryType: EInvestSummaryDateType,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryDateEntity> {
    let entity;
    if (queryRunner) {
      entity = await queryRunner.manager.findOneBy<InvestSummaryDateEntity>(
        InvestSummaryDateEntity,
        {
          summary_date: summaryDate,
          item_idx: itemIdx,
          summary_type: summaryType,
          unit_idx: unitIdx,
        }
      );
    } else {
      entity = await this.findOneBy({
        summary_date: summaryDate,
        item_idx: itemIdx,
        summary_type: summaryType,
        unit_idx: unitIdx,
      });
    }

    if (!entity) {
      entity = new InvestSummaryDateEntity();
      entity.item_idx = itemIdx;
      entity.unit_idx = unitIdx;
      entity.summary_date = summaryDate;
      entity.summary_type = summaryType;
    }

    entity.inout_total = 0;

    entity.inout_principal_prev = 0;
    entity.inout_principal_current = 0;
    entity.inout_principal_total = 0;

    entity.inout_proceeds_prev = 0;
    entity.inout_proceeds_current = 0;
    entity.inout_proceeds_total = 0;

    entity.revenue_total = 0;

    entity.revenue_interest_prev = 0;
    entity.revenue_interest_current = 0;
    entity.revenue_interest_total = 0;

    entity.revenue_eval_prev = 0;
    entity.revenue_eval = 0;

    entity.earn = 0;
    entity.earn_rate = 0;

    entity.earn_inc_proceeds = 0;
    entity.earn_rate_inc_proceeds = 0;

    entity.earn_prev_diff = 0;
    entity.earn_rate_prev_diff = 0;

    entity.earn_inc_proceeds_prev_diff = 0;
    entity.earn_rate_inc_proceeds_prev_diff = 0;

    return entity;
  }

  /**
   * 이전달 요약 데이터 반환
   * - 월간 요약 데이터 생성용
   * @param itemIdx
   * @param unitIdx
   * @param summaryDate
   * @param queryRunner
   */
  async findPrevMonthData(
    itemIdx: number,
    unitIdx: number,
    summaryDate: string,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryDateEntity | null> {
    return queryRunner
      ? queryRunner.manager.findOne<InvestSummaryDateEntity>(InvestSummaryDateEntity, {
          where: {
            summary_date: LessThan(summaryDate),
            item_idx: itemIdx,
            summary_type: 'month',
            unit_idx: unitIdx,
          },
          order: {summary_date: 'DESC'},
        })
      : this.findOne({
          where: {
            summary_date: LessThan(summaryDate),
            item_idx: itemIdx,
            summary_type: 'month',
            unit_idx: unitIdx,
          },
          order: {summary_date: 'DESC'},
        });
  }

  /**
   * 이전년도 요약 데이터 반환
   * - 년간 요약 데이터 생성용
   * @param itemIdx
   * @param unitIdx
   * @param summaryDate
   * @param queryRunner
   */
  async findPrevYearData(
    itemIdx: number,
    unitIdx: number,
    summaryDate: string,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryDateEntity | null> {
    return queryRunner
      ? queryRunner.manager.findOne(InvestSummaryDateEntity, {
          where: {
            summary_date: LessThan(summaryDate),
            item_idx: itemIdx,
            summary_type: 'year',
            unit_idx: unitIdx,
          },
          order: {
            summary_date: 'DESC',
          },
        })
      : this.findOne({
          where: {
            summary_date: LessThan(summaryDate),
            item_idx: itemIdx,
            summary_type: 'year',
            unit_idx: unitIdx,
          },
          order: {
            summary_date: 'DESC',
          },
        });
  }

  /**
   * 지정한 기간의 유입/유출/평가(이자) 요약 데이터
   * - 월간 요약 데이터를 기반으로 생성
   * - 년간 요약 데이터 생성용
   * @param itemIdx
   * @param unitIdx
   * @param summaryDate
   * @param queryRunner
   */
  async findInoutInterestSummary(
    itemIdx: number,
    unitIdx: number,
    summaryDate: IQueryDateRangeCondition,
    queryRunner?: QueryRunner
  ): Promise<{
    inout_principal_current: number;
    inout_proceeds_current: number;
    revenue_interest_current: number;
  }> {
    return this.createQueryBuilder('summary', queryRunner)
      .select([
        `SUM(summary.inout_principal_current) AS inout_principal_current`,
        `SUM(summary.inout_proceeds_current) AS inout_proceeds_current`,
        `SUM(summary.revenue_interest_current) AS revenue_interest_current`,
      ])
      .where('summary.summary_date BETWEEN :beginDate AND :endDate', {
        beginDate: summaryDate.begin,
        endDate: summaryDate.end,
      })
      .andWhere('summary.item_idx = :item_idx', {item_idx: itemIdx})
      .andWhere(`summary.summary_type = 'month'`)
      .andWhere('summary.unit_idx = :unit_idx', {unit_idx: unitIdx})
      .getRawOne();
  }

  /**
   * 지정한 기간의 평가(평가금액) 요약 데이터
   * - 월간 요약 데이터를 기반으로 생성
   * - 년간 요약 데이터 생성용
   * @param itemIdx
   * @param unitIdx
   * @param summaryDate
   * @param queryRunner
   */
  async findRevenueEvalSummary(
    itemIdx: number,
    unitIdx: number,
    summaryDate: IQueryDateRangeCondition,
    queryRunner?: QueryRunner
  ): Promise<{val: number}> {
    return this.createQueryBuilder('summary', queryRunner)
      .select(['revenue_eval AS val'])
      .where('summary.summary_date BETWEEN :beginDate AND :endDate', {
        beginDate: summaryDate.begin,
        endDate: summaryDate.end,
      })
      .andWhere('summary.item_idx = :item_idx', {item_idx: itemIdx})
      .andWhere(`summary.summary_type = 'month'`)
      .andWhere('summary.unit_idx = :unit_idx', {unit_idx: unitIdx})
      .orderBy('summary.summary_date', 'DESC')
      .getRawOne();
  }

  /**
   * 월간 요약 데이터 만들 범위 min/max 반환
   * - 지정 날짜 이후의 월간 요약 데이터 갱신시 사용
   * @param itemIdx
   * @param unitIdx
   * @param summaryDate
   * @param queryRunner
   */
  async findMonthSummaryDateRange(
    itemIdx: number,
    unitIdx: number,
    summaryDate: string,
    queryRunner?: QueryRunner
  ): Promise<{minDate: string; maxDate: string}> {
    const result = await this.createQueryBuilder('summary', queryRunner)
      .select(['MIN(summary_date) AS minDate', 'MAX(summary_date) AS maxDate'])
      .where('summary.summary_date > :summary_date', {summary_date: summaryDate})
      .andWhere('summary.item_idx = :item_idx', {item_idx: itemIdx})
      .andWhere(`summary.summary_type = 'month'`)
      .andWhere('summary.unit_idx = :unit_idx', {unit_idx: unitIdx})
      .getRawOne();

    const minDate =
      result && result.minDate ? DateHelper.format(result.minDate, 'YYYY-MM-DD') : null;
    const maxDate =
      result && result.maxDate ? DateHelper.format(result.maxDate, 'YYYY-MM-DD') : null;

    return {minDate: minDate, maxDate: maxDate};
  }

  /**
   * 년간 요약 데이터 만들 범위 min/max 반환
   * - 지정 날짜 이후의 년간 요약 데이터 갱신시 사용
   * @param itemIdx
   * @param unitIdx
   * @param summaryDate
   * @param queryRunner
   */
  async findYearSummaryDateRange(
    itemIdx: number,
    unitIdx: number,
    summaryDate: string,
    queryRunner?: QueryRunner
  ): Promise<{minYear: number; maxYear: number}> {
    const result = await this.createQueryBuilder('summary', queryRunner)
      .select([
        `MIN(DATE_FORMAT(summary_date, '%Y')) AS minYear`,
        `MAX(DATE_FORMAT(summary_date, '%Y')) AS maxYear`,
      ])
      .where('summary.summary_date > :summary_date', {summary_date: summaryDate})
      .andWhere('summary.item_idx = :item_idx', {item_idx: itemIdx})
      .andWhere(`summary.summary_type = 'year'`)
      .andWhere('summary.unit_idx = :unit_idx', {unit_idx: unitIdx})
      .getRawOne();

    const minYear = result && result.minYear ? parseInt(result.minYear) : null;
    const maxYear = result && result.maxYear ? parseInt(result.maxYear) : null;

    return {minYear: minYear, maxYear: maxYear};
  }
}
