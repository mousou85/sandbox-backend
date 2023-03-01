import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, SelectQueryBuilder} from 'typeorm';

import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestUnitEntity} from '@db/entity';
import {BaseRepository} from '@db/repository';

export interface IInvestUnitCondition {
  item_idx?: number;
  user_idx?: number;
}

export interface IInvestUnitJoinOption {
  user?: boolean;
}

@Injectable()
export class InvestUnitRepository extends BaseRepository<InvestUnitEntity> {
  constructor(
    @InjectRepository(InvestUnitEntity)
    protected repository: Repository<InvestUnitEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder(joinOption?: IInvestUnitJoinOption) {
    const builder = this.repository.createQueryBuilder('unit');
    if (joinOption?.user) {
      builder.innerJoinAndSelect('unit.user', 'user');
    }

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestUnitEntity>,
    condition: IInvestUnitCondition
  ) {
    const {user_idx, item_idx} = condition;

    if (user_idx) {
      queryBuilder.andWhere('unit.user_idx = :user_idx', {user_idx: user_idx});
    }
    if (item_idx) {
      queryBuilder.andWhere('item.item_idx = :item_idx', {item_idx: item_idx});
    }

    return queryBuilder;
  }

  async existsBy(condition: IInvestUnitCondition): Promise<boolean> {
    return super.existsBy(condition);
  }

  async countByCondition(condition: IInvestUnitCondition): Promise<number> {
    return super.countByCondition(condition);
  }

  async findByCondition(
    condition: IInvestUnitCondition,
    joinOption?: IInvestUnitJoinOption
  ): Promise<InvestUnitEntity | null> {
    return super.findByCondition(condition, joinOption);
  }

  async findAllByCondition(
    condition: IInvestUnitCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestUnitJoinOption
  ): Promise<IFindAllResult<InvestUnitEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption);
  }
}
