import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {IInvestUnitJoinOption, InvestUnitRepository} from '@db/repository';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestUnitEntity} from '@db/entity';

@Injectable()
export class InvestUnitService {
  constructor(
    protected dataSource: DataSource,
    protected investUnitRepository: InvestUnitRepository
  ) {}

  /**
   * 단위 목록 반환
   * @param itemIdx
   * @param listOption
   * @param joinOption
   */
  async getUnitList(
    itemIdx: number,
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
      {item_idx: itemIdx},
      {getAll, pageSize, page, sort},
      joinOption
    );
  }
}
