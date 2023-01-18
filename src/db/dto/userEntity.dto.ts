import {BaseDto} from '@db/dto';
import {UserEntity} from '@db/entity';
import {ApiProperty} from '@nestjs/swagger';
import {IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Expose, Transform} from 'class-transformer';
import {DtoTransform} from '@common/dto.transform';
import {EYNState} from '@db/db.enum';
import {IsDateString} from '@common/validateDecorator';

/**
 * user entity DTO
 */
export class UserEntityDto extends BaseDto<UserEntity> {
  @ApiProperty({description: '유저 IDX', example: 1})
  @Expose()
  @IsInt()
  @IsNotEmpty()
  user_idx: number;

  @ApiProperty({description: 'UID', required: true})
  @Expose()
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  uid: string;

  @ApiProperty({description: '유저 ID', required: true})
  @Expose()
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  id: string;

  @ApiProperty({description: '비밀번호', required: true})
  @Expose()
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({description: '이름', example: '홍길동'})
  @Expose()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.trim(value))
  name: string;

  @ApiProperty({description: '가입일', required: true, example: '2022-01-01 00:00:00'})
  @Expose()
  @IsDateString()
  @IsNotEmpty()
  created_at: string;

  @ApiProperty()
  @Expose()
  @IsDateString({allowEmptyString: true})
  @IsOptional()
  last_login_at: string;

  @ApiProperty()
  @Expose()
  @IsInt()
  @IsNotEmpty()
  @Transform(({value}) => DtoTransform.parseInt(value))
  login_fail_count: number;

  @ApiProperty()
  @Expose()
  @IsEnum(EYNState)
  @IsNotEmpty()
  use_otp: EYNState;
}
