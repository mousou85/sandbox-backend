import {BadRequestException, Injectable} from '@nestjs/common';
import {DataSource, FindOptionsWhere} from 'typeorm';

import {CreateInvestItemDto, UpdateInvestItemDto} from '@app/invest/dto';
import {InvestItemEntity, InvestUnitEntity, InvestUnitSetEntity} from '@app/invest/entity';
import {
  IInvestItemCondition,
  IInvestItemJoinOption,
  InvestHistoryRepository,
  InvestItemRepository,
  InvestUnitRepository,
} from '@app/invest/repository';
import {IFindAllResult, IQueryListOption} from '@common/db';
import {DataNotFoundException} from '@common/exception';

@Injectable()
export class InvestItemService {
  constructor(
    protected dataSource: DataSource,
    protected investItemRepository: InvestItemRepository,
    protected investUnitRepository: InvestUnitRepository,
    protected investHistoryRepository: InvestHistoryRepository
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
   * 상픔 생성
   * @param userIdx
   * @param createDto
   */
  async createItem(userIdx: number, createDto: CreateInvestItemDto): Promise<InvestItemEntity> {
    //상품 insert
    const itemEntity = this.investItemRepository.create();
    itemEntity.user_idx = userIdx;
    itemEntity.item_type = createDto.itemType;
    itemEntity.item_name = createDto.itemName;
    await this.investItemRepository.save(itemEntity);

    return itemEntity;
  }

  /**
   * 상픔 수정
   * @param itemIdx
   * @param updateDto
   */
  async updateItem(itemIdx: number, updateDto: UpdateInvestItemDto): Promise<InvestItemEntity> {
    const itemEntity = await this.investItemRepository.findOneBy({item_idx: itemIdx});
    if (!itemEntity) throw new DataNotFoundException('invest item');
    const oldIsClose = itemEntity.is_close;

    //set vars: update dto props
    const {itemType, itemName, isClose, closedAt} = updateDto;

    //상품 update
    if (itemType) itemEntity.item_type = itemType;
    if (itemName) itemEntity.item_name = itemName;
    if (isClose) {
      itemEntity.is_close = isClose;
      itemEntity.closed_at = isClose == 'y' ? closedAt : null;
    }
    await this.investItemRepository.save(itemEntity);

    //isClose: y 변경시 summary update
    if (isClose == 'y' && oldIsClose != isClose) {
    }

    return itemEntity;
  }

  /**
   * 상픔 삭제
   * @param itemIdx
   */
  async deleteItem(itemIdx: number): Promise<void> {
    //상품 유무 체크
    const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx});
    if (!hasItem) throw new DataNotFoundException('invest item');

    //히스토리 유무 체크
    const hasHistory = await this.investHistoryRepository.existsBy({item_idx: itemIdx});
    if (hasHistory) throw new BadRequestException('Item with history cannot be deleted');

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //unit set 삭제
      const unitSetWhere: FindOptionsWhere<InvestUnitSetEntity> = {item_idx: itemIdx};
      await entityManager.delete(InvestUnitSetEntity, unitSetWhere);

      //item 삭제
      const itemWhere: FindOptionsWhere<InvestItemEntity> = {item_idx: itemIdx};
      await entityManager.delete(InvestItemEntity, itemWhere);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 상품에 등록된 단위 목록 반환
   * @param itemIdx
   */
  async getUnitList(itemIdx: number): Promise<InvestUnitEntity[]> {
    const {list} = await this.investUnitRepository.findAllByCondition(
      {item_idx: itemIdx},
      {getAll: true, sort: {column: 'unit.unit_idx', direction: 'ASC'}}
    );

    return list;
  }

  /**
   * 상품에 등록된 단위 여부 반환
   * @param itemIdx
   * @param unitIdx
   */
  async hasUnit(itemIdx: number, unitIdx: number): Promise<boolean> {
    return this.investUnitRepository.existsBy({unit_idx: unitIdx, item_idx: itemIdx});
  }

  /**
   * 상품에 단위 추가
   * @param itemIdx 상품 idx
   * @param unitIdxs 추가할 단위 idx 목록
   */
  async addUnit(itemIdx: number, unitIdxs: number[]): Promise<void> {
    //상품 유무 체크
    const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx});
    if (!hasItem) throw new DataNotFoundException('invest item');

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      for (const unitIdx of unitIdxs) {
        //단위 유무 체크
        const hasUnit = await entityManager.exists(InvestUnitEntity, {where: {unit_idx: unitIdx}});
        if (!hasUnit) throw new DataNotFoundException('invest unit');

        //상품에 존재하는 단위인지 확인
        const hasUnitSet = await entityManager.exists(InvestUnitSetEntity, {
          where: {
            item_idx: itemIdx,
            unit_idx: unitIdx,
          },
        });
        if (hasUnitSet) continue;

        //상품에 단위 추가
        const entity = new InvestUnitSetEntity();
        entity.item_idx = itemIdx;
        entity.unit_idx = unitIdx;
        await entityManager.save(entity, {reload: false});
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 상품에 단위 제거
   * @param itemIdx 상품 idx
   * @param unitIdxs 제거할 단위 idx 목록
   */
  async removeUnit(itemIdx: number, unitIdxs: number[]): Promise<void> {
    //상품 유무 체크
    const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx});
    if (!hasItem) throw new DataNotFoundException('invest item');

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      for (const unitIdx of unitIdxs) {
        //set vars: 데이터
        const entity = await entityManager.findOneBy(InvestUnitSetEntity, {
          item_idx: itemIdx,
          unit_idx: unitIdx,
        });
        if (!entity) continue;

        //상품에 단위 제거
        await entityManager.remove(entity);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
