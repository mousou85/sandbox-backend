import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {isDefined, isNotEmpty} from 'class-validator';
import {DataSource} from 'typeorm';

import {CreateInvestHistoryDto, UpdateInvestHistoryDto} from '@app/invest/dto';
import {InvestHistoryEntity} from '@app/invest/entity';
import {
  IInvestHistoryCondition,
  IInvestHistoryJoinOption,
  InvestHistoryRepository,
  InvestItemRepository,
  InvestUnitRepository,
} from '@app/invest/repository';
import {InvestSummaryService} from '@app/invest/service';
import {IFindAllResult, IQueryListOption} from '@common/db';
import {DataNotFoundException} from '@common/exception';
import {DateHelper} from '@common/helper';

@Injectable()
export class InvestHistoryService {
  constructor(
    protected dataSource: DataSource,
    protected investHistoryRepository: InvestHistoryRepository,
    protected investItemRepository: InvestItemRepository,
    protected investUnitRepository: InvestUnitRepository,
    @Inject(forwardRef(() => InvestSummaryService))
    protected investSummaryService: InvestSummaryService
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
    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //상품 유무 체크
      const hasItem = await this.investItemRepository.existsBy({item_idx: itemIdx}, queryRunner);
      if (!hasItem) throw new DataNotFoundException('invest item');

      //단위 유무 확인
      const hasUnit = await this.investUnitRepository.existsBy(
        {
          unit_idx: createDto.unitIdx,
          item_idx: itemIdx,
        },
        queryRunner
      );
      if (!hasUnit) throw new DataNotFoundException('invest unit');

      //set vars: create dto props
      const {unitIdx, historyDate, historyType, inoutType, revenueType, val, memo} = createDto;

      //히스토리 insert
      const historyEntity = new InvestHistoryEntity();
      historyEntity.item_idx = itemIdx;
      historyEntity.unit_idx = unitIdx;
      historyEntity.history_date = historyDate;
      historyEntity.history_type = historyType;
      if (historyType == 'inout' && inoutType) historyEntity.inout_type = inoutType;
      if (historyType == 'revenue' && revenueType) historyEntity.revenue_type = revenueType;
      historyEntity.val = val;
      if (memo) historyEntity.memo = memo;

      await entityManager.save(historyEntity);

      //요약 데이터 생성/갱신
      await this.investSummaryService.upsertAllSummary(itemIdx, unitIdx, historyDate, queryRunner);

      await queryRunner.commitTransaction();

      return historyEntity;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 히스토리 수정
   * @param historyIdx
   * @param updateDto
   */
  async updateHistory(
    historyIdx: number,
    updateDto: UpdateInvestHistoryDto
  ): Promise<InvestHistoryEntity> {
    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //set vars: 히스토리 데이터
      const historyEntity = await entityManager.findOneBy(InvestHistoryEntity, {
        history_idx: historyIdx,
      });
      if (!historyEntity) throw new DataNotFoundException('invest history');

      //set vars: create dto props
      const {historyDate, val, memo} = updateDto;

      //히스토리 update
      let prevHistoryDate;
      if (historyDate) {
        prevHistoryDate = historyEntity.history_date;
        historyEntity.history_date = historyDate;
      }
      if (isDefined(val)) {
        historyEntity.val = val;
      }
      if (isDefined(memo)) {
        historyEntity.memo = isNotEmpty(memo) ? memo : null;
      }

      await entityManager.save(historyEntity);

      //요약 데이터 생성/갱신
      if (historyDate || isDefined(val)) {
        let summaryTargetDate;
        if (prevHistoryDate && historyDate) {
          summaryTargetDate =
            DateHelper.diff(prevHistoryDate, historyDate) < 0 ? prevHistoryDate : historyDate;
        } else {
          summaryTargetDate = historyEntity.history_date;
        }

        await this.investSummaryService.upsertAllSummary(
          historyEntity.item_idx,
          historyEntity.unit_idx,
          summaryTargetDate,
          queryRunner
        );
      }

      await queryRunner.commitTransaction();

      return historyEntity;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 히스토리 삭제
   * @param historyIdx
   */
  async deleteHistory(historyIdx: number) {
    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //set vars: 히스토리 데이터
      const historyEntity = await entityManager.findOneBy(InvestHistoryEntity, {
        history_idx: historyIdx,
      });
      if (!historyEntity) throw new DataNotFoundException('invest history');

      //set vars: 히스토리 정보
      const itemIdx = historyEntity.item_idx;
      const unitIdx = historyEntity.unit_idx;
      const historyDate = historyEntity.history_date;

      //히스토리 delete
      await entityManager.remove(historyEntity);

      //요약 데이터 생성/갱신
      await this.investSummaryService.upsertAllSummary(itemIdx, unitIdx, historyDate, queryRunner);

      await queryRunner.commitTransaction();

      return historyEntity;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
