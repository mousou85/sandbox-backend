import {ApiExtraModels, ApiProperty, PickType} from '@nestjs/swagger';
import {Expose, Transform, Type} from 'class-transformer';
import {IsNotEmpty, MaxLength, ValidateNested} from 'class-validator';

import {InvestItemDto} from '@app/invest/dto';
import {IsDateString, IsInt} from '@common/decorator/validate';
import {DefaultDto} from '@common/dto';
import {DtoTransform} from '@common/dto.transform';
import {InvestGroupEntity} from '@db/entity';

/**
 * 상품 그룹 DTO(심플)
 */
export class InvestGroupDtoSimple extends DefaultDto {
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
  @Transform(({value}) => DtoTransform.trim(value))
  groupName: string;

  @ApiProperty({description: '생성 시간', required: true})
  @Expose()
  @IsDateString({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value))
  createdAt: string;

  constructor(investGroupEntity?: InvestGroupEntity) {
    super();
    if (investGroupEntity) {
      this.groupIdx = investGroupEntity.group_idx;
      this.groupName = investGroupEntity.group_name;
      this.createdAt = investGroupEntity.created_at;
    }
  }
}

/**
 * 상품 그룹 DTO
 */
@ApiExtraModels(() => InvestItemDto)
export class InvestGroupDto extends InvestGroupDtoSimple {
  @ApiProperty({
    description: '소속 상품 목록',
    type: () => [InvestItemDto],
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

  constructor(investGroupEntity?: InvestGroupEntity) {
    super(investGroupEntity);
  }
}

/**
 * 상품 그룹 생성 DTO
 */
export class CreateInvestGroupDto extends PickType(InvestGroupDtoSimple, ['groupName'] as const) {}

/**
 * 상품 그룹 수정 DTO
 */
export class UpdateInvestGroupDto extends PickType(InvestGroupDtoSimple, ['groupName'] as const) {}
