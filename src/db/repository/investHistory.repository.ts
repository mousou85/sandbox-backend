import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, SelectQueryBuilder} from 'typeorm';

import {TypeOrmHelper} from '@common/helper';
import {
  EComparisonOp,
  EInvestHistoryInOutType,
  EInvestHistoryRevenueType,
  EInvestHistoryType,
} from '@db/db.enum';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestHistoryEntity} from '@db/entity';
import {BaseRepository} from '@db/repository';

export interface IInvestHistoryCondition {
  history_idx?: number;
  item_idx?: number;
  unit_idx?: number;
  user_idx?: number;
  history_date?: {begin: string; end: string} | {value: string; op: EComparisonOp};
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

  getCustomQueryBuilder(joinOption?: IInvestHistoryJoinOption) {
    const builder = this.repository.createQueryBuilder('history');
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
      if ('op' in history_date) {
        queryBuilder.andWhere(`history.history_date ${history_date.op} :history_date`, {
          history_date: history_date.value,
        });
      } else {
        TypeOrmHelper.addBetweenClause(
          queryBuilder,
          'history.history_date',
          history_date.begin,
          history_date.end,
          {paramName: 'historyDate', operator: 'and'}
        );
      }
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

  async existsBy(condition: IInvestHistoryCondition): Promise<boolean> {
    return super.existsBy(condition);
  }

  async countByCondition(condition: IInvestHistoryCondition): Promise<number> {
    return super.countByCondition(condition);
  }

  async findByCondition(
    condition: IInvestHistoryCondition,
    joinOption?: IInvestHistoryJoinOption
  ): Promise<InvestHistoryEntity | null> {
    return super.findByCondition(condition, joinOption);
  }

  async findAllByCondition(
    condition: IInvestHistoryCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestHistoryJoinOption
  ): Promise<IFindAllResult<InvestHistoryEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption);
  }
}
