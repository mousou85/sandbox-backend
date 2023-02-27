import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {IInvestGroupCondition, IInvestGroupJoinOption, InvestGroupRepository} from '@db/repository';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {InvestGroupEntity, InvestGroupItemEntity} from '@db/entity';
import {CreateInvestGroupDto, UpdateInvestGroupDto} from '@app/invest/dto';
import {DataNotFoundException} from '@common/exception';

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

  /**
   * 상품 그룹 수정
   * @param groupIdx
   * @param updateDto
   */
  async updateGroup(groupIdx: number, updateDto: UpdateInvestGroupDto): Promise<InvestGroupEntity> {
    const entity = await this.investGroupRepository.findOneBy({group_idx: groupIdx});
    if (!entity) throw new DataNotFoundException('invest group');

    entity.group_name = updateDto.groupName;
    await this.investGroupRepository.save(entity);

    return entity;
  }

  /**
   * 상품 그룹 삭제
   * @param groupIdx
   */
  async deleteGroup(groupIdx: number): Promise<void> {
    const hasData = await this.investGroupRepository.existsBy({group_idx: groupIdx});
    if (!hasData) throw new DataNotFoundException('invest group');

    await this.investGroupRepository.delete({group_idx: groupIdx});
  }

  /**
   * 상품 그룹에 상품 추가
   * @param groupIdx 그룹 idx
   * @param itemIdxs 추가할 상품 idx 목록
   */
  async addItem(groupIdx: number, itemIdxs: number[]): Promise<void> {
    //그룹 유무 체크
    const hasGroup = await this.investGroupRepository.existsBy({group_idx: groupIdx});
    if (!hasGroup) throw new DataNotFoundException('invest group');

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      for (const itemIdx of itemIdxs) {
        //그룹에 존재하는 상품인지 확인
        const hasItem = await entityManager.exists(InvestGroupItemEntity, {
          where: {
            group_idx: groupIdx,
            item_idx: itemIdx,
          },
        });
        if (hasItem) continue;

        //그룹에 상품 추가
        const entity = new InvestGroupItemEntity();
        entity.group_idx = groupIdx;
        entity.item_idx = itemIdx;
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
   * 상품 그룹에 상품 제거
   * @param groupIdx 그룹 idx
   * @param itemIdxs 제거할 상품 idx 목록
   */
  async removeItem(groupIdx: number, itemIdxs: number[]): Promise<void> {
    //그룹 유무 체크
    const hasGroup = await this.investGroupRepository.existsBy({group_idx: groupIdx});
    if (!hasGroup) throw new DataNotFoundException('invest group');

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      for (const itemIdx of itemIdxs) {
        //set vars: 데이터
        const entity = await entityManager.findOneBy(InvestGroupItemEntity, {
          group_idx: groupIdx,
          item_idx: itemIdx,
        });
        if (!entity) continue;

        //그룹에 상품 제거
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
