import {IsNotEmpty, MaxLength, ValidateNested} from 'class-validator';
import {Expose, Transform, Type} from 'class-transformer';
import {DtoTransform} from '@common/dto.transform';
import {IsDateString, IsInt} from '@common/decorator/validate';
import {ApiExtraModels, ApiProperty, getSchemaPath} from '@nestjs/swagger';
import {InvestItemDto} from '@app/invest/dto/investItem.dto';
import {InvestGroupEntity, InvestItemEntity} from '@db/entity';
import {DefaultDto} from '@common/dto';

/**
 * 상품 그룹 DTO
 */
@ApiExtraModels(InvestItemDto)
export class InvestGroupDto extends DefaultDto {
  constructor(investGroupEntity?: InvestGroupEntity, investItemEntities?: InvestItemEntity[]) {
    super();
    if (investGroupEntity) {
      this.groupIdx = investGroupEntity.group_idx;
      this.groupName = investGroupEntity.group_name;
      this.createdAt = investGroupEntity.created_at;

      const investItems = investItemEntities ?? investGroupEntity.investItem;
      if (investItems && Array.isArray(investItems)) {
        for (const item of investItems) {
          this.itemList.push(new InvestItemDto(item));
        }
      }
    }
  }

  @ApiProperty({description: '그룹 IDX', required: true})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  groupIdx: number;

  @ApiProperty({description: '그룹명', required: true})
  @Expose()
  @MaxLength(50)
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({
    description: '소속 상품 목록',
    type: 'array',
    items: {$ref: getSchemaPath(InvestItemDto)},
    required: true,
  })
  @Expose()
  @ValidateNested({each: true})
  @Type(() => InvestItemDto)
  itemList: InvestItemDto[] = [];

  @ApiProperty({description: '소속된 상품 갯수', required: true})
  @Expose()
  @IsInt()
  get itemCount(): number {
    return Array.isArray(this.itemList) ? this.itemList.length : 0;
  }

  @ApiProperty({description: '생성 시간', required: true})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value))
  createdAt: string;
}
