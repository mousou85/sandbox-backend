import {ApiProperty} from '@nestjs/swagger';
import {DefaultDto} from '@common/dto';
import {Expose, Transform} from 'class-transformer';
import {IsEnum, IsInt} from '@common/decorator/validate';
import {IsNotEmpty} from 'class-validator';
import {DtoTransform} from '@common/dto.transform';
import {InvestUnitEntity} from '@db/entity';
import {EInvestUnitType} from '@db/db.enum';

/**
 * 단위 DTO
 */
export class InvestUnitDto extends DefaultDto {
  @ApiProperty({description: '단위 IDX', required: true})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  unitIdx: number;

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

  constructor(data?: InvestUnitEntity) {
    super();
    if (data) {
      this.unitIdx = data.unit_idx;
      this.unit = data.unit;
      this.unitType = data.unit_type;
    }
  }
}