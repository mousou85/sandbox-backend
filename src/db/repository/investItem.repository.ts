import {Injectable} from '@nestjs/common';
import {BaseRepository} from '@db/repository/base.repository';
import {InvestItemEntity} from '@db/entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, SelectQueryBuilder} from 'typeorm';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {EYNState} from '@db/db.enum';

export interface IInvestItemCondition {
  group_idx?: number;
  user_idx?: number;
  item_type?: string;
  is_close?: EYNState;
}

export interface IInvestItemJoinOption {
  investGroup?: boolean;
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

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestItemEntity>,
    condition: IInvestItemCondition
  ) {
    const {
      group_idx: groupIdx,
      user_idx: userIdx,
      item_type: itemType,
      is_close: isClose,
    } = condition;

    if (groupIdx) {
      queryBuilder.andWhere('group.group_idx = :group_idx', {group_idx: groupIdx});
    }
    if (userIdx) {
      queryBuilder.andWhere('item.user_idx = :user_idx', {user_idx: userIdx});
    }
    if (itemType) {
      queryBuilder.andWhere('item.item_type = :item_type', {item_type: itemType});
    }
    if (isClose) {
      queryBuilder.andWhere('item.is_close = :is_close', {is_close: isClose});
    }

    return queryBuilder;
  }

  async existsBy(condition: IInvestItemCondition): Promise<boolean> {
    return super.existsBy(condition);
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
