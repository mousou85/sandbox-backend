/**
 * user login log types
 */
export const EUserLoginLogType = {
  BAD_REQUEST: 'badRequest',
  LOGIN: 'login',
  ATTEMPT: 'attempt',
  PASSWORD_MISMATCH: 'passwordMismatch',
  LOGIN_FAIL_EXCEED: 'loginFailExceed',
} as const;
export type EUserLoginLogType = (typeof EUserLoginLogType)[keyof typeof EUserLoginLogType];
