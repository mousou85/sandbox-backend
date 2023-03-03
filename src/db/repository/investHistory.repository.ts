import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, SelectQueryBuilder} from 'typeorm';

import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestHistoryEntity} from '@db/entity';
import {BaseRepository} from '@db/repository';

export interface IInvestHistoryCondition {
  history_idx?: number;
  item_idx?: number;
  unit_idx?: number;
  user_idx?: number;
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
    if (joinOption?.investUnit) {
      builder.innerJoinAndSelect('history.investUnit', 'unit');
    }

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestHistoryEntity>,
    condition: IInvestHistoryCondition
  ) {
    const {history_idx, item_idx, unit_idx, user_idx} = condition;

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
