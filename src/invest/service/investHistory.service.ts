import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {CreateInvestHistoryDto} from '@app/invest/dto';
import {DataNotFoundException} from '@common/exception';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestHistoryEntity} from '@db/entity';
import {
  IInvestHistoryCondition,
  IInvestHistoryJoinOption,
  InvestHistoryRepository,
  InvestUnitRepository,
} from '@db/repository';

@Injectable()
export class InvestHistoryService {
  constructor(
    protected dataSource: DataSource,
    protected investHistoryRepository: InvestHistoryRepository,
    protected investUnitRepository: InvestUnitRepository
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

  /**
   * 히스토리 생성
   * @param itemIdx
   * @param createDto
   */
  async createHistory(
    itemIdx: number,
    createDto: CreateInvestHistoryDto
  ): Promise<InvestHistoryEntity> {
    //단위 유무 확인
    const hasUnit = await this.investUnitRepository.existsBy({
      unit_idx: createDto.unitIdx,
      item_idx: itemIdx,
    });
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //set vars: create dto props
    const {unitIdx, historyDate, historyType, inoutType, revenueType, val, memo} = createDto;

    //히스토리 insert
    const historyEntity = this.investHistoryRepository.create();
    historyEntity.unit_idx = unitIdx;
    historyEntity.history_date = historyDate;
    historyEntity.history_type = historyType;
    if (historyType == 'inout' && inoutType) historyEntity.inout_type = inoutType;
    if (historyType == 'revenue' && revenueType) historyEntity.revenue_type = revenueType;
    historyEntity.val = val;
    if (memo) historyEntity.memo = memo;
    await this.investHistoryRepository.save(historyEntity);

    return historyEntity;
  }
}
