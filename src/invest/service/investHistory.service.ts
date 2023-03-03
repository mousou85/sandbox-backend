import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestHistoryEntity} from '@db/entity';
import {
  IInvestHistoryCondition,
  IInvestHistoryJoinOption,
  InvestHistoryRepository,
} from '@db/repository';

@Injectable()
export class InvestHistoryService {
  constructor(
    protected dataSource: DataSource,
    protected investHistoryRepository: InvestHistoryRepository
  ) {}

  /**
   * 히스토리 유무 체크
   * @param condition
   */
  async hasHistory(condition: IInvestHistoryCondition): Promise<boolean> {
    return this.investHistoryRepository.existsBy(condition);
  }

  /**
   * 히스토리 반환
   * @param condition
   * @param joinOption
   */
  async getHistory(
    condition: IInvestHistoryCondition,
    joinOption?: IInvestHistoryJoinOption
  ): Promise<InvestHistoryEntity> {
    return this.investHistoryRepository.findByCondition(condition, joinOption);
  }

  /**
   * 히스토리 목록 반환
   * @param condition
   * @param listOption
   * @param joinOption
   */
  async getHistoryList(
    condition: IInvestHistoryCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestHistoryJoinOption
  ): Promise<IFindAllResult<InvestHistoryEntity>> {
    let {sort, page, pageSize, getAll} = listOption;

    if (!sort) {
      sort = [
        {column: 'history.history_date', direction: 'DESC'},
        {column: 'history.history_idx', direction: 'DESC'},
      ];
    }
    if (!getAll) {
      if (!page) page = 1;
      if (!pageSize) pageSize = 20;
    }

    return this.investHistoryRepository.findAllByCondition(
      condition,
      {getAll, pageSize, page, sort},
      joinOption
    );
  }
}
