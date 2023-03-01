import {createParamDecorator, ExecutionContext} from '@nestjs/common';

import {AuthUserDto} from '@app/auth/dto';

type TAuthUSerDtoProps = {
  [K in keyof AuthUserDto]: AuthUserDto[K] extends Function ? never : K;
}[keyof AuthUserDto];

/**
 * 현재 인증된 유저의 데이터
 *
 * For example:
 * ```ts
 * //user entity 반환
 * @User() user: AuthUserDto
 * //특정 속성만 반환
 * @User('user_idx') userIdx
 * ```
 */
export const User = createParamDecorator((data: TAuthUSerDtoProps, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user: AuthUserDto = req.user;
  return data ? user?.[data] : user;
});
