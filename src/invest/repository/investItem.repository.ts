import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {QueryRunner, Repository, SelectQueryBuilder} from 'typeorm';

import {InvestItemEntity} from '@app/invest/entity';
import {BaseRepository, EYNState, IFindAllResult, IQueryListOption} from '@common/db';
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

  getCustomQueryBuilder(joinOption?: IInvestItemJoinOption, queryRunner?: QueryRunner) {
    const builder = this.repository.createQueryBuilder('item', queryRunner);
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
        ? TypeOrmHelper.addInClause(queryBuilder, 'item.item_idx', item_idx, {
            paramName: 'item_idx',
          })
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

  async existsBy(condition: IInvestItemCondition, queryRunner?: QueryRunner): Promise<boolean> {
    return super.existsBy(condition, queryRunner);
  }

  async countByCondition(
    condition: IInvestItemCondition,
    queryRunner?: QueryRunner
  ): Promise<number> {
    return super.countByCondition(condition, queryRunner);
  }

  async findByCondition(
    condition: IInvestItemCondition,
    joinOption?: IInvestItemJoinOption,
    queryRunner?: QueryRunner
  ): Promise<InvestItemEntity | null> {
    return super.findByCondition(condition, joinOption, queryRunner);
  }

  async findAllByCondition(
    condition: IInvestItemCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestItemJoinOption,
    queryRunner?: QueryRunner
  ): Promise<IFindAllResult<InvestItemEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption, queryRunner);
  }
}
