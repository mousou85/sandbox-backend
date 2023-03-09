import {ApiProperty} from '@nestjs/swagger';
import {Expose, Transform} from 'class-transformer';
import {IsNotEmpty} from 'class-validator';

import {DefaultDto, DtoTransform} from '@common/dto';

/**
 * OTP 등록 요청 응답 DTO
 */
export class ResponseRegisterOtpDto extends DefaultDto {
  @ApiProperty({description: 'OTP secret'})
  @Expose()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({description: 'QR code image'})
  @Expose()
  @IsNotEmpty()
  qrCodeImage: string;

  constructor(data?: {secret: string; qrCodeImage: string}) {
    super();
    if (data) {
      const {secret, qrCodeImage} = data;
      this.secret = secret;
      this.qrCodeImage = qrCodeImage;
    }
  }
}

/**
 * OTP 등록 인증 요청 DTO
 */
export class RegisterOtpDto {
  @ApiProperty({description: 'OTP secret'})
  @Expose()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  secret: string;

  @ApiProperty({description: 'OTP token'})
  @Expose()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  token: string;
}
