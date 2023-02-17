import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {IInvestGroupJoinOption, InvestGroupRepository} from '@db/repository';
import {IQueryListOption} from '@db/db.interface';

@Injectable()
export class InvestGroupService {
  constructor(
    protected dataSource: DataSource,
    protected investGroupRepository: InvestGroupRepository
  ) {}

  /**
   * 상품 그룹 목록 반환
   * @param userIdx
   * @param listOption
   * @param joinOption
   */
  async getGroupList(
    userIdx: number,
    listOption?: IQueryListOption,
    joinOption?: IInvestGroupJoinOption
  ) {
    let {sort, page, pageSize, getAll} = listOption;

    if (!sort) sort = {column: 'group.group_idx', direction: 'ASC'};
    if (!getAll) {
      if (!page) page = 1;
      if (!pageSize) pageSize = 20;
    }

    return this.investGroupRepository.findAllByCondition(
      {user_idx: userIdx},
      {getAll, pageSize, page, sort},
      joinOption
    );
  }
}
