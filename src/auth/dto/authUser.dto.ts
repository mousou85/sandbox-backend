import {Transform} from 'class-transformer';
import {IsNotEmpty, IsOptional, MaxLength} from 'class-validator';

import {UserEntity} from '@app/user/entity';
import {IsEnum, IsInt} from '@common/decorator/validate';
import {DtoTransform} from '@common/dto';
import {DtoHelper} from '@common/helper';

/**
 * 인증 유저 정보
 */
export class AuthUserDto {
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  userIdx: number;

  @MaxLength(50)
  @IsNotEmpty()
  uid: string;

  @MaxLength(100)
  @IsNotEmpty()
  id: string;

  @MaxLength(255)
  @IsNotEmpty()
  password: string;

  @MaxLength(255)
  @IsNotEmpty()
  passwordSalt: string;

  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseDate(value))
  createdAt: string;

  @IsOptional()
  @Transform(({value}) => DtoTransform.parseDate(value))
  lastLoginAt: string;

  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  loginFailCount: number;

  @IsEnum(['y', 'n'], {allowEmptyString: false})
  @IsNotEmpty()
  useOtp: 'y' | 'n';

  @IsOptional()
  otpSecret?: string;

  fromInstance(instance: UserEntity): this {
    let plain = {
      userIdx: instance.user_idx,
      uid: instance.uid,
      id: instance.id,
      password: instance.password,
      name: instance.name,
      createdAt: instance.created_at,
      lastLoginAt: instance.last_login_at,
      loginFailCount: instance.login_fail_count,
      useOtp: instance.use_otp,
    };
    if (instance.userPasswordSalt) plain['passwordSalt'] = instance.userPasswordSalt.salt;
    if (instance.userOtp) plain['otpSecret'] = instance.userOtp.secret;

    DtoHelper.transformForExistsDto(plain, this, {
      keyToCamelCase: false,
      excludeExtraneousValues: false,
    });
    return this;
  }
}
