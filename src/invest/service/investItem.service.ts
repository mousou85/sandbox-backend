import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {IInvestItemJoinOption, InvestItemRepository} from '@db/repository';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestItemEntity} from '@db/entity';

@Injectable()
export class InvestItemService {
  constructor(
    protected dataSource: DataSource,
    protected investItemRepository: InvestItemRepository
  ) {}

  /**
   * 상품 목록 반환
   * @param groupIdx
   * @param listOption
   * @param joinOption
   */
  async getItemList(
    groupIdx: number,
    listOption?: IQueryListOption,
    joinOption?: IInvestItemJoinOption
  ): Promise<IFindAllResult<InvestItemEntity>> {
    let {sort, page, pageSize, getAll} = listOption;

    if (!sort) sort = {column: 'item.item_idx', direction: 'ASC'};
    if (!getAll) {
      if (!page) page = 1;
      if (!pageSize) pageSize = 20;
    }

    return this.investItemRepository.findAllByCondition(
      {group_idx: groupIdx},
      {getAll, pageSize, page, sort},
      joinOption
    );
  }
}
