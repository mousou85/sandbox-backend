import {createParamDecorator, ExecutionContext} from '@nestjs/common';

import {HttpHelper} from '@common/helper';

/**
 * user agent 반환 데코레이터
 */
export const UserAgent = createParamDecorator((data, ctx: ExecutionContext): string => {
  return HttpHelper.getUserAgent();
});
