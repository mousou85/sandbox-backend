import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {IInvestGroupCondition, IInvestGroupJoinOption, InvestGroupRepository} from '@db/repository';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestGroupEntity} from '@db/entity';
import {CreateInvestGroupDto} from '@app/invest/dto';

@Injectable()
export class InvestGroupService {
  constructor(
    protected dataSource: DataSource,
    protected investGroupRepository: InvestGroupRepository
  ) {}

  /**
   * 상품 그룹 유무 체크
   * @param condition
   */
  async hasGroup(condition: IInvestGroupCondition): Promise<boolean> {
    return this.investGroupRepository.existsBy(condition);
  }

  /**
   * 상품 그룹 반환
   * @param condition
   * @param joinOption
   */
  async getGroup(
    condition: IInvestGroupCondition,
    joinOption?: IInvestGroupJoinOption
  ): Promise<InvestGroupEntity> {
    return this.investGroupRepository.findByCondition(condition, joinOption);
  }

  /**
   * 상품 그룹 목록 반환
   * @param condition
   * @param listOption
   * @param joinOption
   */
  async getGroupList(
    condition: IInvestGroupCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestGroupJoinOption
  ): Promise<IFindAllResult<InvestGroupEntity>> {
    let {sort, page, pageSize, getAll} = listOption;

    if (!sort) sort = {column: 'group.group_idx', direction: 'ASC'};
    if (!getAll) {
      if (!page) page = 1;
      if (!pageSize) pageSize = 20;
    }

    return this.investGroupRepository.findAllByCondition(
      condition,
      {getAll, pageSize, page, sort},
      joinOption
    );
  }

  /**
   * 상픔 그룹 생성
   * @param userIdx
   * @param createDto
   */
  async createGroup(userIdx: number, createDto: CreateInvestGroupDto): Promise<InvestGroupEntity> {
    const entity = this.investGroupRepository.create();
    entity.user_idx = userIdx;
    entity.group_name = createDto.groupName;
    await this.investGroupRepository.save(entity);

    return entity;
  }
}
