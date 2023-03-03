import {ApiProperty, IntersectionType, PickType} from '@nestjs/swagger';
import {Expose, Transform} from 'class-transformer';
import {IsNotEmpty, IsNumber, IsOptional} from 'class-validator';

import {InvestUnitDto} from '@app/invest/dto/investUnit.dto';
import {IsDateString, IsEnum, IsInt} from '@common/decorator/validate';
import {DefaultDto} from '@common/dto';
import {DtoTransform} from '@common/dto.transform';
import {DtoHelper} from '@common/helper';
import {EInvestHistoryInOutType, EInvestHistoryRevenueType, EInvestHistoryType} from '@db/db.enum';
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
  @IsDateString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value, 'YYYY-MM-DD'))
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

  @ApiProperty({
    description: '유입/유출 타입',
    required: false,
    type: 'string',
    enum: EInvestHistoryInOutType,
  })
  @Expose()
  @IsEnum(EInvestHistoryInOutType, {allowEmptyString: true})
  @IsOptional()
  @Transform(({value}) => DtoTransform.trim(value))
  inoutType?: EInvestHistoryInOutType;

  @ApiProperty({
    description: '평가/수익 타입',
    required: false,
    type: 'string',
    enum: EInvestHistoryRevenueType,
  })
  @Expose()
  @IsEnum(EInvestHistoryRevenueType, {allowEmptyString: true})
  @IsOptional()
  @Transform(({value}) => DtoTransform.trim(value))
  revenueType?: EInvestHistoryRevenueType;

  @ApiProperty({description: '값', required: true, type: 'number'})
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  val: number;

  @ApiProperty({description: '메모', required: false, type: 'string'})
  @Expose()
  @IsOptional()
  @Transform(({value}) => DtoTransform.trim(value))
  memo?: string;

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
export class InvestHistoryDto extends IntersectionType(
  InvestHistoryDtoSimple,
  PickType(InvestUnitDto, ['unit', 'unitType'] as const)
) {
  constructor(data?: InvestHistoryEntity) {
    super();
    if (data) {
      DtoHelper.transformForExistsDto(data, this, {
        keyToCamelCase: true,
        excludeExtraneousValues: true,
      });

      if (data.investUnit) {
        const unitEntity = data.investUnit;

        this.unit = unitEntity.unit;
        this.unitType = unitEntity.unit_type;
      }
    }
  }
}
