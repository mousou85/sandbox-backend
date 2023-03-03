import {
  EInvestHistoryInOutType,
  EInvestHistoryRevenueType,
  EInvestHistoryType,
  EInvestItemType,
} from '@db/db.enum';

/**
 * 투자 상품 타입 라벨
 */
export const EInvestItemTypeLabel: {
  [key in (typeof EInvestItemType)[keyof typeof EInvestItemType]]: string;
} = {
  cash: '현금',
  deposit: '예금',
  saving: '적금',
  trade: '매매',
  future: '선물',
  defi: '디파이',
  p2p: 'P2P',
} as const;
export type EInvestItemTypeLabel = (typeof EInvestItemTypeLabel)[keyof typeof EInvestItemTypeLabel];

/**
 * 투자 히스토리 타입 라벨
 */
export const EInvestHistoryTypeLabel: {
  [key in (typeof EInvestHistoryType)[keyof typeof EInvestHistoryType]]: string;
} = {
  inout: '유입/유출',
  revenue: '평가/수익',
} as const;
export type EInvestHistoryTypeLabel =
  (typeof EInvestHistoryTypeLabel)[keyof typeof EInvestHistoryTypeLabel];

/**
 * 투자 히스토리 유입/유출 타입 라벨
 */
export const EInvestHistoryInOutTypeLabel: {
  [key in (typeof EInvestHistoryInOutType)[keyof typeof EInvestHistoryInOutType]]: string;
} = {
  principal: '원금',
  proceeds: '수익금',
} as const;
export type EInvestHistoryInOutTypeLabel =
  (typeof EInvestHistoryInOutTypeLabel)[keyof typeof EInvestHistoryInOutTypeLabel];

/**
 * 투자 히스토리 평가/수익 타입
 */
export const EInvestHistoryRevenueTypeLabel: {
  [key in (typeof EInvestHistoryRevenueType)[keyof typeof EInvestHistoryRevenueType]]: string;
} = {
  eval: '평가금액',
  interest: '이자',
} as const;
export type EInvestHistoryRevenueTypeLabel =
  (typeof EInvestHistoryRevenueTypeLabel)[keyof typeof EInvestHistoryRevenueTypeLabel];
