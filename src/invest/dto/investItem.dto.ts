import {EYNState} from '@db/db.enum';
import {Expose, Transform} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {IsDateString, IsEnum, IsInt} from '@common/decorator/validate';
import {IsNotEmpty, IsOptional} from 'class-validator';
import {DtoTransform} from '@common/dto.transform';

/**
 * 투자 상품 DTO
 */
export class InvestItemDto {
  @ApiProperty({description: '상품 IDX'})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  itemIdx: number;

  @ApiProperty({description: '상품 타입'})
  @Expose()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  itemType: string;

  @ApiProperty({description: '상품명'})
  @Expose()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  itemName: string;

  @ApiProperty({description: '생성 시간'})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value))
  createdAt: string;

  @ApiProperty({description: '투자 종료 여부'})
  @Expose()
  @IsEnum(EYNState, {allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  isClose: EYNState;

  @ApiProperty({description: '투자 종료 시간'})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsOptional()
  @Transform(({value}) => DtoTransform.parseDate(value))
  closedAt?: string;
}
