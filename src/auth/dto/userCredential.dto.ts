import {IsNotEmpty} from 'class-validator';
import {Expose, Transform} from 'class-transformer';
import {DtoTransform} from '@common/dto.transform';
import {ApiProperty} from '@nestjs/swagger';

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
