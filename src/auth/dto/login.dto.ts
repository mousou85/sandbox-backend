import {ApiProperty} from '@nestjs/swagger';
import {Expose, Transform} from 'class-transformer';
import {IsBoolean, IsNotEmpty, MaxLength} from 'class-validator';

import {EYNState} from '@common/db';
import {IsEnum, IsInt} from '@common/decorator/validate';
import {DefaultDto, DtoTransform} from '@common/dto';

export class LoginSuccessDto extends DefaultDto {
  @ApiProperty({description: 'access token', required: true})
  @Expose()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({description: 'refresh token', required: true})
  @Expose()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({description: 'user idx', required: true})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  userIdx: number;

  @ApiProperty({description: 'user id', required: true})
  @Expose()
  @MaxLength(100)
  @IsNotEmpty()
  id: string;

  @ApiProperty({description: 'user name', required: true})
  @Expose()
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @ApiProperty({description: 'use otp flag', required: true, type: 'enum', enum: EYNState})
  @Expose()
  @IsEnum(EYNState, {allowEmptyString: false})
  @IsNotEmpty()
  useOtp: EYNState;

  constructor(data?: {
    accessToken: string;
    refreshToken: string;
    userIdx: number;
    id: string;
    name: string;
    useOtp: EYNState;
  }) {
    super();
    if (data) {
      const {accessToken, refreshToken, userIdx, id, name, useOtp} = data;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.userIdx = userIdx;
      this.id = id;
      this.name = name;
      this.useOtp = useOtp;
    }
  }
}

export class NeedOtpVerifyDto extends DefaultDto {
  @ApiProperty({description: 'need otp verify', required: true})
  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  needOTPVerify: boolean;

  constructor(needOTPVerify?: boolean) {
    super();
    if (needOTPVerify !== undefined && needOTPVerify !== null) {
      this.needOTPVerify = needOTPVerify;
    }
  }
}
