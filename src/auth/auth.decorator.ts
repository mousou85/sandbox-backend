import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {UserEntity} from '@db/entity';

type TUserEntityProps = {
  [K in keyof UserEntity]: UserEntity[K] extends Function ? never : K;
}[keyof UserEntity];

/**
 * 현재 인증된 유저의 user entity
 *
 * For example:
 * ```ts
 * //user entity 반환
 * @User() user: UserEntity
 * //특정 속성만 반환
 * @User('user_idx') userIdx
 * ```
 */
export const User = createParamDecorator((data: TUserEntityProps, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user: UserEntity = req.user;
  return data ? user?.[data] : user;
});
