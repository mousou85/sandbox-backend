/**
 * Y/N enum
 */
export const EYNState = {
  y: 'y',
  n: 'n',
} as const;
export type EYNState = (typeof EYNState)[keyof typeof EYNState];

/**
 * 투자 히스토리 타입
 */
export const EInvestHistoryType = {
  revenue: 'revenue',
  inout: 'inout',
} as const;
export type EInvestHistoryType = (typeof EInvestHistoryType)[keyof typeof EInvestHistoryType];

/**
 * 투자 히스토리 유입/유출 타입
 */
export const EInvestHistoryInOutType = {
  principal: 'principal',
  proceeds: 'proceeds',
} as const;
export type EInvestHistoryInOutType =
  (typeof EInvestHistoryInOutType)[keyof typeof EInvestHistoryInOutType];

/**
 * 투자 히스토리 평가/수익 타입
 */
export const EInvestHistoryRevenueType = {
  interest: 'interest',
  eval: 'eval',
} as const;
export type EInvestHistoryRevenueType =
  (typeof EInvestHistoryRevenueType)[keyof typeof EInvestHistoryRevenueType];

/**
 * 투자 기간 요약 타입
 */
export const EInvestSummaryDateType = {
  month: 'month',
  year: 'year',
} as const;
export type EInvestSummaryDateType =
  (typeof EInvestSummaryDateType)[keyof typeof EInvestSummaryDateType];

/**
 * 투자 단위 타입
 */
export const EInvestUnitType = {
  int: 'int',
  float: 'float',
} as const;
export type EInvestUnitType = (typeof EInvestUnitType)[keyof typeof EInvestUnitType];
