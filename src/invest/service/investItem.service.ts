import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {IInvestItemCondition, IInvestItemJoinOption, InvestItemRepository} from '@db/repository';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestItemEntity} from '@db/entity';
import {EInvestItemType} from '@db/db.enum';

export type TInvestItemType = {[V in EInvestItemType]?: string};

@Injectable()
export class InvestItemService {
  constructor(
    protected dataSource: DataSource,
    protected investItemRepository: InvestItemRepository
  ) {}

  /**
   * 상품 타입 리스트
   */
  static getItemTypeList(): TInvestItemType {
    let retVal: TInvestItemType = {};
    Object.values(EInvestItemType).forEach((typeKey) => {
      let typeName;
      switch (typeKey) {
        case 'cash':
          typeName = '현금';
          break;
        case 'deposit':
          typeName = '예금';
          break;
        case 'saving':
          typeName = '적금';
          break;
        case 'trade':
          typeName = '매매';
          break;
        case 'future':
          typeName = '선물';
          break;
        case 'defi':
          typeName = '디파이';
          break;
        case 'p2p':
        default:
          typeName = 'P2P';
      }

      retVal[typeKey] = typeName;
    });

    return retVal;
  }

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
