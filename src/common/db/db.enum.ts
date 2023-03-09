/**
 * 비교 연산자
 * - repository 사용
 */
export const EComparisonOp = {
  eq: '=',
  lt: '<',
  lte: '<=',
  gt: '>',
  gte: '>=',
} as const;
export type EComparisonOp = (typeof EComparisonOp)[keyof typeof EComparisonOp];

/**
 * Y/N enum
 */
export const EYNState = {
  y: 'y',
  n: 'n',
} as const;
export type EYNState = (typeof EYNState)[keyof typeof EYNState];
