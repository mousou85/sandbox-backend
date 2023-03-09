import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {QueryRunner, Repository, SelectQueryBuilder} from 'typeorm';

import {InvestGroupEntity} from '@app/invest/entity';
import {BaseRepository, IFindAllResult, IQueryListOption} from '@common/db';
import {TypeOrmHelper} from '@common/helper';

export interface IInvestGroupCondition {
  group_idx?: number;
  user_idx?: number;
  group_name?: {
    op: 'match' | 'like';
    value: string;
  };
}

export interface IInvestGroupJoinOption {
  user?: boolean;
  investItem?: boolean;
}

@Injectable()
export class InvestGroupRepository extends BaseRepository<InvestGroupEntity> {
  constructor(
    @InjectRepository(InvestGroupEntity)
    protected repository: Repository<InvestGroupEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder(joinOption?: IInvestGroupJoinOption, queryRunner?: QueryRunner) {
    const builder = this.repository.createQueryBuilder('group', queryRunner);
    if (joinOption?.user) {
      builder.innerJoinAndSelect('group.user', 'user');
    }
    if (joinOption?.investItem) {
      builder.leftJoinAndSelect('group.investItem', 'item');
    }

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestGroupEntity>,
    condition: IInvestGroupCondition
  ) {
    const {group_idx, user_idx, group_name} = condition;

    if (group_idx) {
      queryBuilder.andWhere('group.group_idx = :group_idx', {group_idx});
    }
    if (user_idx) {
      queryBuilder.andWhere('group.user_idx = :user_idx', {user_idx});
    }
    if (group_name) {
      if (group_name.op == 'match') {
        queryBuilder.andWhere('group.group_name = :group_name', {group_name: group_name.value});
      } else {
        TypeOrmHelper.addLikeClause(queryBuilder, 'group.group_name', group_name.value, {
          paramName: 'group_name',
          operator: 'and',
        });
      }
    }

    return queryBuilder;
  }

  async existsBy(condition: IInvestGroupCondition, queryRunner?: QueryRunner): Promise<boolean> {
    return super.existsBy(condition, queryRunner);
  }

  async countByCondition(
    condition: IInvestGroupCondition,
    queryRunner?: QueryRunner
  ): Promise<number> {
    return super.countByCondition(condition, queryRunner);
  }

  async findByCondition(
    condition: IInvestGroupCondition,
    joinOption?: IInvestGroupJoinOption,
    queryRunner?: QueryRunner
  ): Promise<InvestGroupEntity | null> {
    return super.findByCondition(condition, joinOption, queryRunner);
  }

  async findAllByCondition(
    condition: IInvestGroupCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestGroupJoinOption,
    queryRunner?: QueryRunner
  ): Promise<IFindAllResult<InvestGroupEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption, queryRunner);
  }
}
