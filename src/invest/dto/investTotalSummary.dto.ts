import {ApiProperty} from '@nestjs/swagger';
import {Expose, Transform, Type} from 'class-transformer';
import {IsNotEmpty, ValidateNested} from 'class-validator';

import {IsEnum} from '@common/decorator/validate';
import {DefaultDto} from '@common/dto';
import {DtoTransform} from '@common/dto.transform';
import {CommonHelper} from '@common/helper';
import {EInvestUnitType} from '@db/db.enum';
import {InvestSummaryEntity} from '@db/entity';

/**
 * 전체 요약 DTO의 유입/유출 속성 DTO
 */
class InvestTotalSummaryInoutPropsDto {
  @ApiProperty({description: '총합', required: true})
  @Expose()
  @IsNotEmpty()
  total: number;

  @ApiProperty({description: '원금', required: true})
  @Expose()
  @IsNotEmpty()
  principal: number;

  @ApiProperty({description: '수익 재투자금', required: true})
  @Expose()
  @IsNotEmpty()
  proceeds: number;

  constructor(total: number, principal: number, proceeds: number) {
    this.total = total;
    this.principal = principal;
    this.proceeds = proceeds;
  }
}

/**
 * 전체 요약 DTO의 평가 속성 DTO
 */
class InvestTotalSummaryRevenuePropsDto {
  @ApiProperty({description: '총합', required: true})
  @Expose()
  @IsNotEmpty()
  total: number;

  @ApiProperty({description: '이자', required: true})
  @Expose()
  @IsNotEmpty()
  interest: number;

  @ApiProperty({description: '평가금액', required: true})
  @Expose()
  @IsNotEmpty()
  eval: number;

  constructor(total: number, interest: number, evalVal: number) {
    this.total = total;
    this.interest = interest;
    this.eval = evalVal;
  }
}

/**
 * 전체 요약 DTO의 수익 속성 DTO
 */
class InvestTotalSummaryEarnPropsDto {
  @ApiProperty({description: '수익(재투자금 제외)', required: true})
  @Expose()
  @IsNotEmpty()
  earn: number;

  @ApiProperty({description: '수익률(재투자금 제외)', required: true})
  @Expose()
  @IsNotEmpty()
  rate: number;

  @ApiProperty({description: '수익(재투자금 포함)', required: true})
  @Expose()
  @IsNotEmpty()
  earnIncProceeds: number;

  @ApiProperty({description: '수익률(재투자금 포함)', required: true})
  @Expose()
  @IsNotEmpty()
  rateIncProceeds: number;

  constructor(earn: number, rate: number, earnIncProceeds: number, rateIncProceeds: number) {
    this.earn = earn;
    this.rate = CommonHelper.parseFloat(rate, 2);
    this.earnIncProceeds = earnIncProceeds;
    this.rateIncProceeds = CommonHelper.parseFloat(rateIncProceeds, 2);
  }
}

/**
 * 전체 요약 DTO
 */
export class InvestTotalSummaryDto extends DefaultDto {
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

  @ApiProperty({
    description: '유입/유출',
    required: true,
    type: () => InvestTotalSummaryInoutPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestTotalSummaryInoutPropsDto)
  inout: InvestTotalSummaryInoutPropsDto;

  @ApiProperty({
    description: '평가',
    required: true,
    type: () => InvestTotalSummaryRevenuePropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestTotalSummaryRevenuePropsDto)
  revenue: InvestTotalSummaryRevenuePropsDto;

  @ApiProperty({
    description: '수익',
    required: true,
    type: () => InvestTotalSummaryEarnPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestTotalSummaryEarnPropsDto)
  earn: InvestTotalSummaryEarnPropsDto;

  constructor(data?: InvestSummaryEntity) {
    super();
    if (data) {
      this.inout = new InvestTotalSummaryInoutPropsDto(
        data.inout_total,
        data.inout_principal,
        data.inout_proceeds
      );
      this.revenue = new InvestTotalSummaryRevenuePropsDto(
        data.revenue_total,
        data.revenue_interest,
        data.revenue_eval
      );
      this.earn = new InvestTotalSummaryEarnPropsDto(
        data.earn,
        data.earn_rate,
        data.earn_inc_proceeds,
        data.earn_rate_inc_proceeds
      );

      if (data.investUnit) {
        this.unit = data.investUnit.unit;
        this.unitType = data.investUnit.unit_type;
      }
    }
  }
}
