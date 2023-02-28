import {EInvestItemType} from '@db/db.enum';

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
