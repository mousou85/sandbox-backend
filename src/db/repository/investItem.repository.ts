import {Injectable} from '@nestjs/common';
import {BaseRepository} from '@db/repository/base.repository';
import {InvestItemEntity} from '@db/entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, SelectQueryBuilder} from 'typeorm';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {EYNState} from '@db/db.enum';
import {TypeOrmHelper} from '@common/helper';

export interface IInvestItemCondition {
  item_idx?: number | number[];
  group_idx?: number;
  user_idx?: number;
  item_type?: string;
  is_close?: EYNState;
}

export interface IInvestItemJoinOption {
  investGroup?: boolean;
  investUnit?: boolean;
  user?: boolean;
}

@Injectable()
export class InvestItemRepository extends BaseRepository<InvestItemEntity> {
  constructor(
    @InjectRepository(InvestItemEntity)
    protected repository: Repository<InvestItemEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder(joinOption?: IInvestItemJoinOption) {
    const builder = this.repository.createQueryBuilder('item');
    if (joinOption?.user) {
      builder.innerJoinAndSelect('group.user', 'user');
    }
    joinOption?.investGroup
      ? builder.leftJoinAndSelect('item.investGroup', 'group')
      : builder.leftJoin('item.investGroup', 'group');
    if (joinOption?.investUnit) {
      builder.leftJoinAndSelect('item.investUnit', 'unit');
    }

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestItemEntity>,
    condition: IInvestItemCondition
  ) {
    const {item_idx, group_idx, user_idx, item_type, is_close} = condition;

    if (item_idx) {
      Array.isArray(item_idx)
        ? TypeOrmHelper.addInClause(queryBuilder, '', item_idx, {paramName: 'item_idx'})
        : queryBuilder.andWhere('item.item_idx = :item_idx', {item_idx});
    }
    if (group_idx) {
      queryBuilder.andWhere('group.group_idx = :group_idx', {group_idx});
    }
    if (user_idx) {
      queryBuilder.andWhere('item.user_idx = :user_idx', {user_idx});
    }
    if (item_type) {
      queryBuilder.andWhere('item.item_type = :item_type', {item_type});
    }
    if (is_close) {
      queryBuilder.andWhere('item.is_close = :is_close', {is_close});
    }

    return queryBuilder;
  }

  async existsBy(condition: IInvestItemCondition): Promise<boolean> {
    return super.existsBy(condition);
  }

  async countByCondition(condition: IInvestItemCondition): Promise<number> {
    return super.countByCondition(condition);
  }

  async findByCondition(
    condition: IInvestItemCondition,
    joinOption?: IInvestItemJoinOption
  ): Promise<InvestItemEntity | null> {
    return super.findByCondition(condition, joinOption);
  }

  async findAllByCondition(
    condition: IInvestItemCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestItemJoinOption
  ): Promise<IFindAllResult<InvestItemEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption);
  }
}
