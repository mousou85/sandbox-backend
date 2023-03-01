import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestUnitEntity} from '@db/entity';
import {IInvestUnitCondition, IInvestUnitJoinOption, InvestUnitRepository} from '@db/repository';

@Injectable()
export class InvestUnitService {
  constructor(
    protected dataSource: DataSource,
    protected investUnitRepository: InvestUnitRepository
  ) {}

  /**
   * 단위 목록 반환
   * @param condition
   * @param listOption
   * @param joinOption
   */
  async getUnitList(
    condition: IInvestUnitCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestUnitJoinOption
  ): Promise<IFindAllResult<InvestUnitEntity>> {
    let {sort, page, pageSize, getAll} = listOption;

    if (!sort) sort = {column: 'unit.unit_idx', direction: 'ASC'};
    if (!getAll) {
      if (!page) page = 1;
      if (!pageSize) pageSize = 20;
    }

    return this.investUnitRepository.findAllByCondition(
      condition,
      {getAll, pageSize, page, sort},
      joinOption
    );
  }
}
