import {EInvestItemType, EYNState} from '@db/db.enum';
import {Expose, Transform, Type} from 'class-transformer';
import {ApiExtraModels, ApiProperty, getSchemaPath} from '@nestjs/swagger';
import {IsDateString, IsEnum, IsInt} from '@common/decorator/validate';
import {IsNotEmpty, IsOptional, ValidateNested} from 'class-validator';
import {DtoTransform} from '@common/dto.transform';
import {InvestItemEntity} from '@db/entity';
import {DefaultDto} from '@common/dto';
import {InvestUnitDto} from '@app/invest/dto';
import {EInvestItemTypeLabel} from '@app/invest/invest.enum';

/**
 * 투자 상품 DTO
 */
@ApiExtraModels(InvestUnitDto)
export class InvestItemDto extends DefaultDto {
  @ApiProperty({description: '상품 IDX', required: true})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  itemIdx: number;

  @ApiProperty({description: '상품 타입', required: true, enum: EInvestItemType})
  @Expose()
  @IsEnum(EInvestItemType, {allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  itemType: EInvestItemType;

  @ApiProperty({description: '상품명', required: true})
  @Expose()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  itemName: string;

  @ApiProperty({description: '생성 시간', required: true})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value))
  createdAt: string;

  @ApiProperty({description: '투자 종료 여부', type: 'enum', enum: EYNState, required: true})
  @Expose()
  @IsEnum(EYNState, {allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  isClose: EYNState;

  @ApiProperty({description: '투자 종료 시간', required: false})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsOptional()
  @Transform(({value}) => DtoTransform.parseDate(value))
  closedAt?: string;

  @ApiProperty({
    description: '단위 목록',
    type: 'array',
    items: {$ref: getSchemaPath(InvestUnitDto)},
    required: true,
  })
  @Expose()
  @ValidateNested({each: true})
  @Type(() => InvestUnitDto)
  unitList: InvestUnitDto[] = [];

  @ApiProperty({description: '사용가능한 단위 갯수', required: true})
  @Expose()
  @IsInt()
  get unitCount(): number {
    return Array.isArray(this.unitList) ? this.unitList.length : 0;
  }

  @ApiProperty({description: '상품 타입 라벨', required: true, enum: EInvestItemTypeLabel})
  @Expose()
  @IsEnum(EInvestItemTypeLabel, {allowEmptyString: false})
  get itemTypeLabel(): EInvestItemTypeLabel {
    return this.itemType ? EInvestItemTypeLabel[this.itemType] : undefined;
  }

  constructor(investItemEntity?: InvestItemEntity) {
    super();
    if (investItemEntity) {
      this.itemIdx = investItemEntity.item_idx;
      this.itemType = investItemEntity.item_type;
      this.itemName = investItemEntity.item_name;
      this.createdAt = investItemEntity.created_at;
      this.isClose = investItemEntity.is_close;
      if (investItemEntity.closed_at) this.closedAt = investItemEntity.closed_at;
    }
  }
}
