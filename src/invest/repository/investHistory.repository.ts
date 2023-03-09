import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {QueryRunner, Repository, SelectQueryBuilder} from 'typeorm';

import {InvestHistoryEntity} from '@app/invest/entity';
import {
  EInvestHistoryInOutType,
  EInvestHistoryRevenueType,
  EInvestHistoryType,
} from '@app/invest/invest.enum';
import {
  BaseRepository,
  IFindAllResult,
  IQueryDateCondition,
  IQueryDateRangeCondition,
  IQueryListOption,
} from '@common/db';
import {TypeOrmHelper} from '@common/helper';

export interface IInvestHistoryCondition {
  history_idx?: number;
  item_idx?: number;
  unit_idx?: number;
  user_idx?: number;
  history_date?: IQueryDateCondition | IQueryDateRangeCondition;
  history_type?: EInvestHistoryType;
  inout_type?: EInvestHistoryInOutType;
  revenue_type?: EInvestHistoryRevenueType;
  unit?: string;
}

export interface IInvestHistoryJoinOption {
  investItem?: boolean;
  investUnit?: boolean;
}

@Injectable()
export class InvestHistoryRepository extends BaseRepository<InvestHistoryEntity> {
  constructor(
    @InjectRepository(InvestHistoryEntity)
    protected repository: Repository<InvestHistoryEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder(joinOption?: IInvestHistoryJoinOption, queryRunner?: QueryRunner) {
    const builder = this.repository.createQueryBuilder('history', queryRunner);
    if (joinOption?.investItem) {
      builder.innerJoinAndSelect('history.investItem', 'item');
      builder.innerJoin('item.user', 'user');
    } else {
      builder.innerJoin('history.investItem', 'item');
      builder.innerJoin('item.user', 'user');
    }
    joinOption?.investUnit
      ? builder.innerJoinAndSelect('history.investUnit', 'unit')
      : builder.innerJoin('history.investUnit', 'unit');

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestHistoryEntity>,
    condition: IInvestHistoryCondition
  ) {
    const {
      history_idx,
      item_idx,
      unit_idx,
      user_idx,
      history_date,
      history_type,
      inout_type,
      revenue_type,
      unit,
    } = condition;

    if (history_idx) {
      queryBuilder.andWhere('history.history_idx = :history_idx', {history_idx});
    }
    if (item_idx) {
      queryBuilder.andWhere('history.item_idx = :item_idx', {item_idx});
    }
    if (unit_idx) {
      queryBuilder.andWhere('history.unit_idx = :unit_idx', {unit_idx});
    }
    if (user_idx) {
      queryBuilder.andWhere('user.user_idx = :user_idx', {user_idx});
    }
    if (history_date) {
      TypeOrmHelper.addDateCondition(queryBuilder, 'history.history_date', history_date, {
        paramName: 'historyDate',
        operator: 'and',
      });
    }
    if (inout_type) {
      queryBuilder.andWhere('history.inout_type = :inout_type', {inout_type});
    }
    if (revenue_type) {
      queryBuilder.andWhere('history.revenue_type = :revenue_type', {revenue_type});
    }
    if (history_type) {
      queryBuilder.andWhere('history.history_type = :history_type', {history_type});
    }
    if (unit) {
      queryBuilder.andWhere('unit.unit = :unit', {unit});
    }

    return queryBuilder;
  }

  async existsBy(condition: IInvestHistoryCondition, queryRunner?: QueryRunner): Promise<boolean> {
    return super.existsBy(condition, queryRunner);
  }

  async countByCondition(
    condition: IInvestHistoryCondition,
    queryRunner?: QueryRunner
  ): Promise<number> {
    return super.countByCondition(condition, queryRunner);
  }

  async findByCondition(
    condition: IInvestHistoryCondition,
    joinOption?: IInvestHistoryJoinOption,
    queryRunner?: QueryRunner
  ): Promise<InvestHistoryEntity | null> {
    return super.findByCondition(condition, joinOption, queryRunner);
  }

  async findAllByCondition(
    condition: IInvestHistoryCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestHistoryJoinOption,
    queryRunner?: QueryRunner
  ): Promise<IFindAllResult<InvestHistoryEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption, queryRunner);
  }

  /**
   * 히스토리의 유입/유출/평가(이자) 요약 데이터 목록 반환
   * @param itemIdx
   * @param unitIdx
   * @param historyDate
   * @param queryRunner
   */
  async findInoutInterestSummary(
    itemIdx: number,
    unitIdx: number,
    historyDate: IQueryDateRangeCondition,
    queryRunner?: QueryRunner
  ): Promise<
    {
      history_type: EInvestHistoryType;
      val_type: EInvestHistoryInOutType | EInvestHistoryRevenueType;
      total_val: number;
    }[]
  > {
    //set vars: 유입/유출/평가(이자) 요약 데이터
    return this.createQueryBuilder('history', queryRunner ?? undefined)
      .select([
        'history.history_type AS history_type',
        `IF(history_type = 'inout', inout_type, revenue_type) AS val_type`,
        `SUM(val) AS total_val`,
      ])
      .where('history.item_idx = :item_idx', {item_idx: itemIdx})
      .andWhere('history.unit_idx = :unit_idx', {unit_idx: unitIdx})
      .andWhere('history.history_date BETWEEN :beginHistoryDate AND :endHistoryDate', {
        beginHistoryDate: historyDate.begin,
        endHistoryDate: historyDate.end,
      })
      .andWhere(
        `(history.history_type = 'inout' OR (history.history_type = 'revenue' AND history.revenue_type = 'interest'))`
      )
      .groupBy('history.history_type, val_type')
      .getRawMany();
  }

  /**
   * 히스토리의 평가(평가금액) 요약 데이터 반환
   * @param itemIdx
   * @param unitIdx
   * @param historyEndDate
   * @param queryRunner
   */
  async findRevenueEvalSummary(
    itemIdx: number,
    unitIdx: number,
    historyEndDate: string,
    queryRunner?: QueryRunner
  ): Promise<{val: number}> {
    return this.createQueryBuilder('history', queryRunner ?? undefined)
      .select(['val AS val'])
      .where('history.item_idx = :item_idx', {item_idx: itemIdx})
      .andWhere('history.unit_idx = :unit_idx', {unit_idx: unitIdx})
      .andWhere('history.history_date <= :history_date', {history_date: historyEndDate})
      .andWhere(`history.revenue_type = 'eval'`)
      .andWhere(`history.history_type = 'revenue'`)
      .orderBy('history.history_date', 'DESC')
      .addOrderBy('history.history_idx', 'DESC')
      .getRawOne();
  }
}
