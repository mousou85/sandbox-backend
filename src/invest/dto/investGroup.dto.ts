import {IsNotEmpty, ValidateNested} from 'class-validator';
import {Expose, Transform, Type} from 'class-transformer';
import {DtoTransform} from '@common/dto.transform';
import {IsDateString, IsInt} from '@common/decorator/validate';
import {ApiProperty, getSchemaPath} from '@nestjs/swagger';
import {InvestItemDto} from '@app/invest/dto/investItem.dto';

/**
 * 상품 그룹 DTO
 */
export class InvestGroupDto {
  @ApiProperty({description: '그룹 IDX'})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  groupIdx: number;

  @ApiProperty({
    description: '소속 상품 목록',
    type: 'array',
    items: {$ref: getSchemaPath(InvestItemDto)},
  })
  @Expose()
  @ValidateNested({each: true})
  @Type(() => InvestItemDto)
  itemList: InvestItemDto[];

  @ApiProperty({description: '소속된 상품 갯수'})
  @Expose()
  get itemCount(): number {
    return Array.isArray(this.itemList) ? this.itemList.length : 0;
  }

  @ApiProperty({description: '생성 시간'})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value))
  createdAt: string;
}
