import {BadRequestException, Injectable} from '@nestjs/common';
import {DataSource, Not} from 'typeorm';

import {CreateInvestUnitDto, UpdateInvestUnitDto} from '@app/invest/dto';
import {InvestUnitEntity} from '@app/invest/entity';
import {
  IInvestUnitCondition,
  IInvestUnitJoinOption,
  InvestHistoryRepository,
  InvestUnitRepository,
} from '@app/invest/repository';
import {IFindAllResult, IQueryListOption} from '@common/db';
import {DataNotFoundException} from '@common/exception';

@Injectable()
export class InvestUnitService {
  constructor(
    protected dataSource: DataSource,
    protected investUnitRepository: InvestUnitRepository,
    protected investHistoryRepository: InvestHistoryRepository
  ) {}

  /**
   * 단위 유무 체크
   * @param condition
   */
  async hasUnit(condition: IInvestUnitCondition): Promise<boolean> {
    return this.investUnitRepository.existsBy(condition);
  }

  /**
   * 단위 갯수 반환
   * @param condition
   */
  async getUnitCount(condition: IInvestUnitCondition): Promise<number> {
    return this.investUnitRepository.countByCondition(condition);
  }

  /**
   * 단위 반환
   * @param condition
   * @param joinOption
   */
  async getUnit(
    condition: IInvestUnitCondition,
    joinOption?: IInvestUnitJoinOption
  ): Promise<InvestUnitEntity> {
    return this.investUnitRepository.findByCondition(condition, joinOption);
  }

  /**
   * 단위 목록 반환
   * @param condition
   * @param listOption
   * @param joinOption
   */
  async getUnitList(
    condition: IInvestUnitCondition,
    listOption?: IQueryListOption,
    joinOption?: IInvestUnitJoinOption
  ): Promise<IFindAllResult<InvestUnitEntity>> {
    let {sort, page, pageSize, getAll} = listOption;

    if (!sort) sort = {column: 'unit.unit_idx', direction: 'ASC'};
    if (!getAll) {
      if (!page) page = 1;
      if (!pageSize) pageSize = 20;
    }

    return this.investUnitRepository.findAllByCondition(
      condition,
      {getAll, pageSize, page, sort},
      joinOption
    );
  }

  /**
   * 단위 생성
   * @param userIdx
   * @param createDto
   */
  async createUnit(userIdx: number, createDto: CreateInvestUnitDto): Promise<InvestUnitEntity> {
    //set vars: create dto props
    const {unit, unitType} = createDto;

    //이미 등록된 단위인지 확인
    const hasUnit = await this.investUnitRepository.existsBy({unit, user_idx: userIdx});
    if (hasUnit) throw new BadRequestException('Unit already exists');

    //단위 insert
    const unitEntity = this.investUnitRepository.create();
    unitEntity.user_idx = userIdx;
    unitEntity.unit = unit;
    unitEntity.unit_type = unitType;
    await this.investUnitRepository.save(unitEntity);

    return unitEntity;
  }
  /**
   * 단위 수정
   * @param userIdx
   * @param unitIdx
   * @param updateDto
   */
  async updateUnit(
    userIdx: number,
    unitIdx: number,
    updateDto: UpdateInvestUnitDto
  ): Promise<InvestUnitEntity> {
    //set vars: update dto props
    const {unit, unitType} = updateDto;

    //set vars: 단위 데이터
    const unitEntity = await this.investUnitRepository.findOneBy({
      unit_idx: unitIdx,
      user_idx: userIdx,
    });
    if (!unitEntity) throw new DataNotFoundException('invest unit');

    //단위 update
    if (unit) {
      //이미 등록된 단위인지 확인
      const hasUnit = await this.investUnitRepository.exist({
        where: {
          user_idx: userIdx,
          unit_idx: Not(unitIdx),
          unit: unit,
        },
      });
      if (hasUnit) throw new BadRequestException('Unit already exists');

      unitEntity.unit = unit;
    }
    if (unitType) unitEntity.unit_type = unitType;
    await this.investUnitRepository.save(unitEntity);

    return unitEntity;
  }

  /**
   * 단위 삭제
   * @param unitIdx
   */
  async deleteUnit(unitIdx: number): Promise<void> {
    //단위 데이터 유무 체크
    const hasUnit = await this.investUnitRepository.existsBy({unit_idx: unitIdx});
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //히스토리 유무 체크
    const hasHistory = await this.investHistoryRepository.existsBy({unit_idx: unitIdx});
    if (hasHistory) throw new BadRequestException('Unit with history cannot be deleted');

    //단위 delete
    await this.investUnitRepository.delete({unit_idx: unitIdx});
  }
}
