/**
 * Y/N enum
 */
export const EYNState = {
  y: 'y',
  n: 'n',
} as const;
export type EYNState = typeof EYNState[keyof typeof EYNState];
