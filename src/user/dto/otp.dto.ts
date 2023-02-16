import {DefaultDto} from '@common/dto';
import {Expose, Transform} from 'class-transformer';
import {IsNotEmpty} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {DtoTransform} from '@common/dto.transform';

/**
 * OTP 등록 요청 응답 DTO
 */
export class ResponseRegisterOtpDto extends DefaultDto<{secret: string; qrCodeImage: string}> {
  @ApiProperty({description: 'OTP secret'})
  @Expose()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({description: 'QR code image'})
  @Expose()
  @IsNotEmpty()
  qrCodeImage: string;
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
