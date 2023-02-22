import {EYNState} from '@db/db.enum';
import {Expose, Transform} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {IsDateString, IsEnum, IsInt} from '@common/decorator/validate';
import {IsNotEmpty, IsOptional} from 'class-validator';
import {DtoTransform} from '@common/dto.transform';
import {InvestItemEntity} from '@db/entity';

/**
 * 투자 상품 DTO
 */
export class InvestItemDto {
  constructor(investItemEntity?: InvestItemEntity) {
    if (investItemEntity) {
      this.itemIdx = investItemEntity.item_idx;
      this.itemType = investItemEntity.item_type;
      this.itemName = investItemEntity.item_name;
      this.createdAt = investItemEntity.created_at;
      this.isClose = investItemEntity.is_close;
      if (investItemEntity.closed_at) this.closedAt = investItemEntity.closed_at;
    }
  }

  @ApiProperty({description: '상품 IDX', required: true})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  itemIdx: number;

  @ApiProperty({description: '상품 타입', required: true})
  @Expose()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  itemType: string;

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
}
