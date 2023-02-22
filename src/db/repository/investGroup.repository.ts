import {Injectable} from '@nestjs/common';
import {BaseRepository} from '@db/repository/base.repository';
import {InvestGroupEntity} from '@db/entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, SelectQueryBuilder} from 'typeorm';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';

export interface IInvestGroupCondition {
  group_idx?: number;
  user_idx?: number;
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

  getCustomQueryBuilder(joinOption?: IInvestGroupJoinOption) {
    const builder = this.repository.createQueryBuilder('group');
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
    if (condition.group_idx) {
      queryBuilder.andWhere('group.group_idx = :group_idx', {group_idx: condition.group_idx});
    }
    if (condition.user_idx) {
      queryBuilder.andWhere('group.user_idx = :user_idx', {user_idx: condition.user_idx});
    }

    return queryBuilder;
  }

  async existsBy(condition: IInvestGroupCondition): Promise<boolean> {
    return super.existsBy(condition);
  }

  async findByCondition(
    condition: IInvestGroupCondition,
    joinOption?: IInvestGroupJoinOption
  ): Promise<InvestGroupEntity | null> {
    return super.findByCondition(condition, joinOption);
  }

  async findAllByCondition(
    condition: IInvestGroupCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestGroupJoinOption
  ): Promise<IFindAllResult<InvestGroupEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption);
  }
}
