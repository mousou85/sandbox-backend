import {ApiProperty} from '@nestjs/swagger';
import {Expose, Transform, Type} from 'class-transformer';
import {IsNotEmpty, ValidateNested} from 'class-validator';

import {InvestSummaryDateEntity} from '@app/invest/entity';
import {EInvestUnitType} from '@app/invest/invest.enum';
import {IsEnum} from '@common/decorator/validate';
import {DefaultDto, DtoTransform} from '@common/dto';
import {CommonHelper, DateHelper} from '@common/helper';

/**
 * 년간/월간 요약 DTO의 유입/유출 속성 DTO
 */
class InvestDateSummaryInoutPropsDto {
  @ApiProperty({description: '총합', required: true})
  @Expose()
  @IsNotEmpty()
  total: number;

  @ApiProperty({description: '원금(총합)', required: true})
  @Expose()
  @IsNotEmpty()
  principalTotal: number;

  @ApiProperty({description: '원금(이전)', required: true})
  @Expose()
  @IsNotEmpty()
  principalPrev: number;

  @ApiProperty({description: '원금(현재)', required: true})
  @Expose()
  @IsNotEmpty()
  principalCurrent: number;

  @ApiProperty({description: '수익 재투자금(총합)', required: true})
  @Expose()
  @IsNotEmpty()
  proceedsTotal: number;

  @ApiProperty({description: '수익 재투자금(이전)', required: true})
  @Expose()
  @IsNotEmpty()
  proceedsPrev: number;

  @ApiProperty({description: '수익 재투자금(현재)', required: true})
  @Expose()
  @IsNotEmpty()
  proceedsCurrent: number;

  constructor(
    total: number,
    principalTotal: number,
    principalPrev: number,
    principalCurrent: number,
    proceedsTotal: number,
    proceedsPrev: number,
    proceedsCurrent: number
  ) {
    this.total = total;
    this.principalTotal = principalTotal;
    this.principalPrev = principalPrev;
    this.principalCurrent = principalCurrent;
    this.proceedsTotal = proceedsTotal;
    this.proceedsPrev = proceedsPrev;
    this.proceedsCurrent = proceedsCurrent;
  }
}

/**
 * 년간/월간 요약 DTO의 평가 속성 DTO
 */
class InvestDateSummaryRevenuePropsDto {
  @ApiProperty({description: '총합', required: true})
  @Expose()
  @IsNotEmpty()
  total: number;

  @ApiProperty({description: '이자(총합)', required: true})
  @Expose()
  @IsNotEmpty()
  interestTotal: number;

  @ApiProperty({description: '이자(이전)', required: true})
  @Expose()
  @IsNotEmpty()
  interestPrev: number;

  @ApiProperty({description: '이자(현재)', required: true})
  @Expose()
  @IsNotEmpty()
  interestCurrent: number;

  @ApiProperty({description: '평가금액(현재)', required: true})
  @Expose()
  @IsNotEmpty()
  eval: number;

  @ApiProperty({description: '평가금액(이전)', required: true})
  @Expose()
  @IsNotEmpty()
  evalPrev: number;

  constructor(
    total: number,
    interestTotal: number,
    interestPrev: number,
    interestCurrent: number,
    evalVal: number,
    evalPrev: number
  ) {
    this.total = total;
    this.interestTotal = interestTotal;
    this.interestPrev = interestPrev;
    this.interestCurrent = interestCurrent;
    this.eval = evalVal;
    this.evalPrev = evalPrev;
  }
}

/**
 * 년간/월간 요약 DTO의 수익 속성 DTO
 */
class InvestDateSummaryEarnPropsDto {
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
 * 월간 요약 DTO
 */
export class InvestMonthlySummaryDto extends DefaultDto {
  @ApiProperty({description: '년도', required: true})
  @Expose()
  @IsNotEmpty()
  year: string;

  @ApiProperty({description: '월', required: true})
  @Expose()
  @IsNotEmpty()
  month: string;

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
    type: () => InvestDateSummaryInoutPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryInoutPropsDto)
  inout: InvestDateSummaryInoutPropsDto;

  @ApiProperty({
    description: '평가',
    required: true,
    type: () => InvestDateSummaryRevenuePropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryRevenuePropsDto)
  revenue: InvestDateSummaryRevenuePropsDto;

  @ApiProperty({
    description: '수익',
    required: true,
    type: () => InvestDateSummaryEarnPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryEarnPropsDto)
  earn: InvestDateSummaryEarnPropsDto;

  @ApiProperty({
    description: '이전 대비 수익',
    required: true,
    type: () => InvestDateSummaryEarnPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryEarnPropsDto)
  earnPrevDiff: InvestDateSummaryEarnPropsDto;

  constructor(data?: InvestSummaryDateEntity) {
    super();
    if (data) {
      this.year = DateHelper.format(data.summary_date, 'YYYY');
      this.month = DateHelper.format(data.summary_date, 'MM');

      this.inout = new InvestDateSummaryInoutPropsDto(
        data.inout_total,
        data.inout_principal_total,
        data.inout_principal_prev,
        data.inout_principal_current,
        data.inout_proceeds_total,
        data.inout_proceeds_prev,
        data.inout_proceeds_current
      );
      this.revenue = new InvestDateSummaryRevenuePropsDto(
        data.revenue_total,
        data.revenue_interest_total,
        data.revenue_interest_prev,
        data.revenue_interest_current,
        data.revenue_eval,
        data.revenue_eval_prev
      );
      this.earn = new InvestDateSummaryEarnPropsDto(
        data.earn,
        data.earn_rate,
        data.earn_inc_proceeds,
        data.earn_rate_inc_proceeds
      );
      this.earnPrevDiff = new InvestDateSummaryEarnPropsDto(
        data.earn_prev_diff,
        data.earn_rate_prev_diff,
        data.earn_inc_proceeds_prev_diff,
        data.earn_rate_inc_proceeds_prev_diff
      );

      if (data.investUnit) {
        this.unit = data.investUnit.unit;
        this.unitType = data.investUnit.unit_type;
      }
    }
  }
}

/**
 * 년간 요약 DTO
 */
export class InvestYearlySummaryDto extends DefaultDto {
  @ApiProperty({description: '년도', required: true})
  @Expose()
  @IsNotEmpty()
  year: string;

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
    type: () => InvestDateSummaryInoutPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryInoutPropsDto)
  inout: InvestDateSummaryInoutPropsDto;

  @ApiProperty({
    description: '평가',
    required: true,
    type: () => InvestDateSummaryRevenuePropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryRevenuePropsDto)
  revenue: InvestDateSummaryRevenuePropsDto;

  @ApiProperty({
    description: '수익',
    required: true,
    type: () => InvestDateSummaryEarnPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryEarnPropsDto)
  earn: InvestDateSummaryEarnPropsDto;

  @ApiProperty({
    description: '이전 대비 수익',
    required: true,
    type: () => InvestDateSummaryEarnPropsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => InvestDateSummaryEarnPropsDto)
  earnPrevDiff: InvestDateSummaryEarnPropsDto;

  constructor(data?: InvestSummaryDateEntity) {
    super();
    if (data) {
      this.year = DateHelper.format(data.summary_date, 'YYYY');

      this.inout = new InvestDateSummaryInoutPropsDto(
        data.inout_total,
        data.inout_principal_total,
        data.inout_principal_prev,
        data.inout_principal_current,
        data.inout_proceeds_total,
        data.inout_proceeds_prev,
        data.inout_proceeds_current
      );
      this.revenue = new InvestDateSummaryRevenuePropsDto(
        data.revenue_total,
        data.revenue_interest_total,
        data.revenue_interest_prev,
        data.revenue_interest_current,
        data.revenue_eval,
        data.revenue_eval_prev
      );
      this.earn = new InvestDateSummaryEarnPropsDto(
        data.earn,
        data.earn_rate,
        data.earn_inc_proceeds,
        data.earn_rate_inc_proceeds
      );
      this.earnPrevDiff = new InvestDateSummaryEarnPropsDto(
        data.earn_prev_diff,
        data.earn_rate_prev_diff,
        data.earn_inc_proceeds_prev_diff,
        data.earn_rate_inc_proceeds_prev_diff
      );

      if (data.investUnit) {
        this.unit = data.investUnit.unit;
        this.unitType = data.investUnit.unit_type;
      }
    }
  }
}
