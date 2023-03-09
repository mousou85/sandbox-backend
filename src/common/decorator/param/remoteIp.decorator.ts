import {createParamDecorator, ExecutionContext} from '@nestjs/common';

import {HttpHelper} from '@common/helper';

/**
 * remote ip 반환 데코레이터
 */
export const RemoteIP = createParamDecorator((data, ctx: ExecutionContext): string => {
  return HttpHelper.getRemoteIp();
});
