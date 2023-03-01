import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, SelectQueryBuilder} from 'typeorm';

import {TypeOrmHelper} from '@common/helper';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestUnitEntity} from '@db/entity';
import {BaseRepository} from '@db/repository';

export interface IInvestUnitCondition {
  unit_idx?: number | number[];
  item_idx?: number;
  user_idx?: number;
}

export interface IInvestUnitJoinOption {
  user?: boolean;
  investItem?: boolean;
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
    joinOption?.investItem
      ? builder.leftJoinAndSelect('unit.investItem', 'item')
      : builder.leftJoin('unit.investItem', 'item');

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestUnitEntity>,
    condition: IInvestUnitCondition
  ) {
    const {unit_idx, user_idx, item_idx} = condition;

    if (unit_idx) {
      Array.isArray(unit_idx)
        ? TypeOrmHelper.addInClause(queryBuilder, 'unit.unit_idx', unit_idx, {
            paramName: 'unit_idx',
          })
        : queryBuilder.andWhere('unit.unit_idx = :unit_idx', {unit_idx});
    }
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
