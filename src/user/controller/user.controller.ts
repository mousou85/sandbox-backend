import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  LoggerService,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AuthService} from '@app/auth/auth.service';
import {UserService} from '@app/user/service';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {UserEntity} from '@db/entity';
import {EditUserInfoDto, UserInfoDto} from '@app/user/dto';
import {OkResponseDto} from '@common/dto';
import {ApiOkResponse} from '@common/decorator/swagger';

@ApiTags('사용자')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/user')
export class UserController {
  constructor(
    @Inject(Logger) private logger: LoggerService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  @ApiOperation({summary: '사용자 정보 조회'})
  // @ApiBody({type: UserCredentialDto})
  @ApiOkResponse({model: UserInfoDto})
  @Get('/info')
  async getInfo(@User() user: UserEntity): Promise<OkResponseDto<UserInfoDto>> {
    const resDto = new UserInfoDto().fromInstance(user);

    return new OkResponseDto(resDto);
  }

  @ApiOperation({summary: '사용자 정보 수정'})
  @ApiOkResponse({model: UserInfoDto})
  @Patch('/info')
  async editInfo(
    @User() user: UserEntity,
    @Body() editDto: EditUserInfoDto
  ): Promise<OkResponseDto<UserInfoDto>> {
    //비밀번호 변경
    if (editDto.newPassword && editDto.currentPassword) {
      //현재 비밀번호 확인
      const isValidCurrentPassword = await this.userService.verifyPasswordByIdx(
        editDto.currentPassword,
        user.user_idx
      );
      if (!isValidCurrentPassword) {
        throw new BadRequestException('current password mismatch');
      }

      //비밀번호 수정
      if (!(await this.userService.changePassword(user.user_idx, editDto.newPassword))) {
        throw new BadRequestException('password change failed');
      }
    }

    //유저 정보 변경
    const userEntity = await this.userService.editInfo(user.user_idx, editDto);

    const resDto = new UserInfoDto().fromInstance(userEntity);

    return new OkResponseDto(resDto);
  }
}
