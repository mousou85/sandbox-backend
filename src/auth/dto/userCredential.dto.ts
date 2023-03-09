import {ApiProperty} from '@nestjs/swagger';
import {Expose, Transform} from 'class-transformer';
import {IsNotEmpty} from 'class-validator';

import {DtoTransform} from '@common/dto';

export class UserCredentialDto {
  @ApiProperty({description: 'user id', example: 'test@test.com'})
  @Expose()
  @Transform(({value}) => DtoTransform.trim(value))
  @IsNotEmpty()
  userId: string;

  @ApiProperty({description: 'user password'})
  @Expose()
  @IsNotEmpty()
  password: string;
}

export class UserOtpCredentialDto extends UserCredentialDto {
  @ApiProperty({description: 'otp token'})
  @Expose()
  @Transform(({value}) => DtoTransform.trim(value))
  @IsNotEmpty()
  token: string;
}
