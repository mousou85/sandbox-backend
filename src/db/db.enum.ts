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
