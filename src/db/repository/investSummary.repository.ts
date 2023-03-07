import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {QueryRunner, Repository, SelectQueryBuilder} from 'typeorm';

import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestSummaryEntity} from '@db/entity';
import {BaseRepository} from '@db/repository';

export interface IInvestSummaryCondition {
  item_idx?: number;
  unit?: string;
  unit_idx?: number;
}

export interface IInvestSummaryJoinOption {
  investItem?: boolean;
  investUnit?: boolean;
}

@Injectable()
export class InvestSummaryRepository extends BaseRepository<InvestSummaryEntity> {
  constructor(
    @InjectRepository(InvestSummaryEntity)
    protected repository: Repository<InvestSummaryEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder(joinOption?: IInvestSummaryJoinOption, queryRunner?: QueryRunner) {
    const builder = this.repository.createQueryBuilder('summary', queryRunner);
    if (joinOption?.investItem) {
      builder.innerJoinAndSelect('summary.investItem', 'item');
    }
    joinOption?.investUnit
      ? builder.innerJoinAndSelect('summary.investUnit', 'unit')
      : builder.innerJoin('summary.investUnit', 'unit');

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<InvestSummaryEntity>,
    condition: IInvestSummaryCondition
  ) {
    const {unit, item_idx, unit_idx} = condition;

    if (item_idx) {
      queryBuilder.andWhere('summary.item_idx = :item_idx', {item_idx});
    }
    if (unit_idx) {
      queryBuilder.andWhere('summary.unit_idx = :unit_idx', {unit_idx});
    }
    if (unit) {
      queryBuilder.andWhere('unit.unit = :unit', {unit});
    }

    return queryBuilder;
  }

  async existsBy(condition: IInvestSummaryCondition, queryRunner?: QueryRunner): Promise<boolean> {
    return super.existsBy(condition, queryRunner);
  }

  async countByCondition(
    condition: IInvestSummaryCondition,
    queryRunner?: QueryRunner
  ): Promise<number> {
    return super.countByCondition(condition, queryRunner);
  }

  async findByCondition(
    condition: IInvestSummaryCondition,
    joinOption?: IInvestSummaryJoinOption,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryEntity | null> {
    return super.findByCondition(condition, joinOption, queryRunner);
  }

  async findAllByCondition(
    condition: IInvestSummaryCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestSummaryJoinOption,
    queryRunner?: QueryRunner
  ): Promise<IFindAllResult<InvestSummaryEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption, queryRunner);
  }

  /**
   * entity를 초기화해서 반환
   * @param itemIdx
   * @param unitIdx
   * @param queryRunner
   */
  async findEntityAndReset(
    itemIdx: number,
    unitIdx: number,
    queryRunner?: QueryRunner
  ): Promise<InvestSummaryEntity> {
    let entity;
    if (queryRunner) {
      entity = await queryRunner.manager.findOneBy<InvestSummaryEntity>(InvestSummaryEntity, {
        item_idx: itemIdx,
        unit_idx: unitIdx,
      });
    } else {
      entity = await this.findOneBy({
        item_idx: itemIdx,
        unit_idx: unitIdx,
      });
    }

    if (!entity) {
      entity = new InvestSummaryEntity();
      entity.item_idx = itemIdx;
      entity.unit_idx = unitIdx;
    }

    entity.inout_total = 0;
    entity.inout_principal = 0;
    entity.inout_proceeds = 0;

    entity.revenue_total = 0;
    entity.revenue_interest = 0;
    entity.revenue_eval = 0;

    entity.earn = 0;
    entity.earn_rate = 0;
    entity.earn_inc_proceeds = 0;
    entity.earn_rate_inc_proceeds = 0;

    return entity;
  }
}
