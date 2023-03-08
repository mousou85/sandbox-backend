import {ApiProperty, PartialType, PickType} from '@nestjs/swagger';
import {Expose, Transform} from 'class-transformer';
import {IsNotEmpty, IsNumberString, IsOptional, ValidateIf} from 'class-validator';

import {
  EInvestHistoryInOutTypeLabel,
  EInvestHistoryRevenueTypeLabel,
  EInvestHistoryTypeLabel,
} from '@app/invest/invest.enum';
import {IsDateOnlyString, IsDateString, IsEnum, IsInt} from '@common/decorator/validate';
import {DefaultDto} from '@common/dto';
import {DtoTransform} from '@common/dto.transform';
import {
  EInvestHistoryInOutType,
  EInvestHistoryRevenueType,
  EInvestHistoryType,
  EInvestUnitType,
} from '@db/db.enum';
import {InvestHistoryEntity} from '@db/entity';

/**
 * 히스토리 DTO(심플)
 */
export class InvestHistoryDtoSimple extends DefaultDto {
  @ApiProperty({description: '히스토리 IDX', required: true, type: 'number'})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  historyIdx: number;

  @ApiProperty({description: '상품 IDX', required: true, type: 'number'})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  itemIdx: number;

  @ApiProperty({description: '단위 IDX', required: true, type: 'number'})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  unitIdx: number;

  @ApiProperty({description: '기록 일자', required: true})
  @Expose()
  @IsDateOnlyString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  historyDate: string;

  @ApiProperty({
    description: '히스토리 타입',
    required: true,
    type: 'string',
    enum: EInvestHistoryType,
  })
  @Expose()
  @IsEnum(EInvestHistoryType, {allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  historyType: EInvestHistoryType;

  @ApiProperty({description: '히스토리 타입 라벨', required: true, enum: EInvestHistoryTypeLabel})
  @Expose()
  @IsEnum(EInvestHistoryTypeLabel, {allowEmptyString: false})
  get historyTypeLabel(): EInvestHistoryTypeLabel {
    return this.historyType ? EInvestHistoryTypeLabel[this.historyType] : undefined;
  }

  @ApiProperty({
    description: '유입/유출 타입',
    required: false,
    type: 'string',
    enum: EInvestHistoryInOutType,
  })
  @Expose()
  @IsEnum(EInvestHistoryInOutType, {allowEmptyString: true})
  @IsNotEmpty()
  @ValidateIf((obj) => obj?.historyType == EInvestHistoryType.inout)
  @Transform(({value}) => DtoTransform.trim(value))
  inoutType?: EInvestHistoryInOutType;

  @ApiProperty({
    description: '유입/유출 타입 라벨',
    required: false,
    enum: EInvestHistoryInOutTypeLabel,
  })
  @Expose()
  @IsEnum(EInvestHistoryInOutTypeLabel, {allowEmptyString: false})
  get inoutTypeLabel(): EInvestHistoryInOutTypeLabel {
    return this.inoutType ? EInvestHistoryInOutTypeLabel[this.inoutType] : undefined;
  }

  @ApiProperty({
    description: '평가/수익 타입',
    required: false,
    type: 'string',
    enum: EInvestHistoryRevenueType,
  })
  @Expose()
  @IsEnum(EInvestHistoryRevenueType, {allowEmptyString: true})
  @IsNotEmpty()
  @ValidateIf((obj) => obj?.historyType == EInvestHistoryType.revenue)
  @Transform(({value}) => DtoTransform.trim(value))
  revenueType?: EInvestHistoryRevenueType;

  @ApiProperty({
    description: '평가/수익 타입 라벨',
    required: false,
    enum: EInvestHistoryRevenueTypeLabel,
  })
  @Expose()
  @IsEnum(EInvestHistoryRevenueTypeLabel, {allowEmptyString: false})
  get revenueTypeLabel(): EInvestHistoryRevenueTypeLabel {
    return this.revenueType ? EInvestHistoryRevenueTypeLabel[this.revenueType] : undefined;
  }

  @ApiProperty({description: '값', required: true, type: 'number'})
  @Expose()
  @IsNumberString()
  @IsNotEmpty()
  val: number;

  @ApiProperty({description: '메모', required: false, type: 'string'})
  @Expose()
  @IsOptional()
  @Transform(({value}) => DtoTransform.trim(value))
  memo: string = null;

  @ApiProperty({description: '생성 시간', required: true})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value))
  createdAt: string;

  constructor(data?: InvestHistoryEntity) {
    super();
    if (data) {
      this.historyIdx = data.history_idx;
      this.itemIdx = data.item_idx;
      this.unitIdx = data.unit_idx;
      this.historyDate = data.history_date;
      this.historyType = data.history_type;
      if (data.inout_type) this.inoutType = data.inout_type;
      if (data.revenue_type) this.revenueType = data.revenue_type;
      this.val = data.val;
      if (data.memo) this.memo = data.memo;
      this.createdAt = data.created_at;
    }
  }
}

/**
 * 히스토리 DTO
 */
export class InvestHistoryDto extends InvestHistoryDtoSimple {
  @ApiProperty({description: '단위', required: true})
  @Expose()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  unit: string;

  @ApiProperty({description: '단위 타입', required: true, enum: EInvestUnitType})
  @Expose()
  @IsEnum(EInvestUnitType, {allowEmptyString: false})
  @IsNotEmpty()
  unitType: EInvestUnitType;

  constructor(data?: InvestHistoryEntity) {
    super(data);
    if (data && data.investUnit) {
      const unitEntity = data.investUnit;

      this.unit = unitEntity.unit;
      this.unitType = unitEntity.unit_type;
    }
  }
}

/**
 * 히스토리 리스트 조회 url query DTO
 */
export class UrlQueryInvestHistoryListDto extends DefaultDto {
  @ApiProperty({
    description: '히스토리 타입',
    required: false,
    type: 'string',
    enum: EInvestHistoryType,
  })
  @Expose()
  @IsEnum(EInvestHistoryType, {allowEmptyString: true})
  @IsOptional()
  @Transform(({value}) => DtoTransform.trim(value))
  historyType?: EInvestHistoryType;

  @ApiProperty({description: '단위', required: false, type: 'string'})
  @Expose()
  @IsOptional()
  @Transform(({value}) => DtoTransform.trim(value))
  unit?: string;

  @ApiProperty({description: '기록일자(년-월)', required: false, type: 'string'})
  @Expose()
  @IsDateOnlyString({allowEmptyString: true, format: 'yearmonth'})
  @IsOptional()
  @Transform(({value}) => DtoTransform.trim(value))
  historyMonth?: string;
}

/**
 * 히스토리 생성 DTO
 */
export class CreateInvestHistoryDto extends PickType(InvestHistoryDtoSimple, [
  'unitIdx',
  'historyDate',
  'historyType',
  'inoutType',
  'revenueType',
  'val',
  'memo',
] as const) {}

/**
 * 히스토리 수정 DTO
 */
export class UpdateInvestHistoryDto extends PartialType(
  PickType(InvestHistoryDtoSimple, ['historyDate', 'val', 'memo'] as const)
) {}
