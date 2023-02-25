import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {IInvestItemCondition, IInvestItemJoinOption, InvestItemRepository} from '@db/repository';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestItemEntity} from '@db/entity';

@Injectable()
export class InvestItemService {
  constructor(
    protected dataSource: DataSource,
    protected investItemRepository: InvestItemRepository
  ) {}

  /**
   * 상품 유무 체크
   * @param condition
   */
  async hasItem(condition: IInvestItemCondition): Promise<boolean> {
    return this.investItemRepository.existsBy(condition);
  }

  async getItemCount(condition: IInvestItemCondition): Promise<number> {
    return this.investItemRepository.countByCondition(condition);
  }

  /**
   * 상품 목록 반환
   * @param condition
   * @param listOption
   * @param joinOption
   */
  async getItemList(
    condition: IInvestItemCondition,
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
      condition,
      {getAll, pageSize, page, sort},
      joinOption
    );
  }
}
