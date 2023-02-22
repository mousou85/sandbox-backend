import {DefaultDto} from '@common/dto';
import {UserEntity} from '@db/entity';
import {ApiProperty, PickType} from '@nestjs/swagger';
import {Expose, Transform} from 'class-transformer';
import {IsEnum, IsInt} from '@common/decorator/validate';
import {IsNotEmpty, IsOptional, MaxLength, MinLength, ValidateIf} from 'class-validator';
import {DtoTransform} from '@common/dto.transform';

/**
 * 사용자 정보 DTO
 */
export class UserInfoDto extends DefaultDto {
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
  @Transform(({value}) => DtoTransform.trim(value))
  name: string;

  @ApiProperty({description: 'use otp flag', required: true})
  @Expose()
  @IsEnum(['y', 'n'], {allowEmptyString: false})
  @IsNotEmpty()
  useOtp: 'y' | 'n';

  constructor(data?: UserEntity) {
    super();
    if (data) {
      this.userIdx = data.user_idx;
      this.id = data.id;
      this.name = data.name;
      this.useOtp = data.use_otp;
    }
  }
}

/**
 * 사용자 정보 수정 DTO
 */
export class EditUserInfoDto extends PickType(UserInfoDto, ['name'] as const) {
  @ApiProperty({description: 'new user password(비밀번호 변경시)', required: false})
  @MinLength(8)
  @Expose()
  @IsOptional()
  newPassword?: string;

  @ApiProperty({description: 'current user password(비밀번호 변경시 필수 입력)', required: false})
  @Expose()
  @IsNotEmpty()
  @ValidateIf((obj) => obj?.newPassword)
  currentPassword?: string;
}
