import {ApiProperty} from '@nestjs/swagger';
import {Expose, Transform} from 'class-transformer';
import {IsBoolean, IsNotEmpty} from 'class-validator';
import {IsEnum, IsInt} from '@common/decorator/validate';
import {DtoTransform} from '@common/dto.transform';
import {DefaultDto} from '@common/dto';

export class LoginSuccessDto extends DefaultDto<any> {
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
  userIdx: string;

  @ApiProperty({description: 'user id', required: true})
  @Expose()
  @IsNotEmpty()
  id: string;

  @ApiProperty({description: 'user name', required: true})
  @Expose()
  @IsNotEmpty()
  name: string;

  @ApiProperty({description: 'use otp flag', required: true})
  @Expose()
  @IsEnum(['y', 'n'], {allowEmptyString: false})
  @IsNotEmpty()
  useOtp: 'y' | 'n';
}

export class NeedOtpVerifyDto extends DefaultDto<any> {
  @ApiProperty({description: 'need otp verify', required: true})
  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  needOTPVerify: boolean;
}
