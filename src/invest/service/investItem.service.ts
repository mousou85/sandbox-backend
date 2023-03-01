import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {CreateInvestItemDto} from '@app/invest/dto';
import {DataNotFoundException} from '@common/exception';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestGroupEntity, InvestGroupItemEntity, InvestItemEntity} from '@db/entity';
import {
  IInvestItemCondition,
  IInvestItemJoinOption,
  InvestGroupRepository,
  InvestItemRepository,
} from '@db/repository';

@Injectable()
export class InvestItemService {
  constructor(
    protected dataSource: DataSource,
    protected investItemRepository: InvestItemRepository,
    protected investGroupRepository: InvestGroupRepository
  ) {}

  /**
   * 상품 유무 체크
   * @param condition
   */
  async hasItem(condition: IInvestItemCondition): Promise<boolean> {
    return this.investItemRepository.existsBy(condition);
  }

  /**
   * 상품 갯수 반환
   * @param condition
   */
  async getItemCount(condition: IInvestItemCondition): Promise<number> {
    return this.investItemRepository.countByCondition(condition);
  }

  /**
   * 상품 반환
   * @param condition
   * @param joinOption
   */
  async getItem(
    condition: IInvestItemCondition,
    joinOption?: IInvestItemJoinOption
  ): Promise<InvestItemEntity> {
    return this.investItemRepository.findByCondition(condition, joinOption);
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

  /**
   * 상픔 그룹 생성
   * @param userIdx
   * @param createDto
   */
  async createItem(userIdx: number, createDto: CreateInvestItemDto): Promise<InvestItemEntity> {
    //그룹 idx있으면 그룹 체크
    if (createDto.groupIdx) {
    }

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //상품 insert
      const itemEntity = this.investItemRepository.create();
      itemEntity.user_idx = userIdx;
      itemEntity.item_type = createDto.itemType;
      itemEntity.item_name = createDto.itemName;
      await entityManager.save(itemEntity);

      //그룹 idx있으면 그룹에 추가
      if (createDto.groupIdx) {
        const hasGroup = await entityManager.exists(InvestGroupEntity, {
          where: {group_idx: createDto.groupIdx},
        });
        if (!hasGroup) throw new DataNotFoundException('invest group');

        const groupItemEntity = new InvestGroupItemEntity();
        groupItemEntity.group_idx = createDto.groupIdx;
        groupItemEntity.item_idx = itemEntity.item_idx;
        await entityManager.save(groupItemEntity, {reload: false});
      }

      await queryRunner.commitTransaction();

      return itemEntity;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
