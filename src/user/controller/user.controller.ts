import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  LoggerService,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AuthService} from '@app/auth/auth.service';
import {UserService} from '@app/user/service';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {
  RegisterOtpDto,
  ResponseRegisterOtpDto,
  UpdateUserInfoDto,
  UserInfoDto,
} from '@app/user/dto';
import {OkResponseDto} from '@common/dto';
import {ApiBodyCustom, ApiOkResponseCustom} from '@common/decorator/swagger';
import {AuthUserDto} from '@app/auth/dto';
import {RequiredPipe} from '@common/pipe';

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
  @ApiOkResponseCustom({model: UserInfoDto})
  @Get('/info')
  async getInfo(@User() user: AuthUserDto): Promise<OkResponseDto<UserInfoDto>> {
    const userEntity = await this.userService.getUser(user.userIdx);

    const resDto = new UserInfoDto(userEntity);

    return new OkResponseDto(resDto);
  }

  @ApiOperation({summary: '사용자 정보 수정'})
  @ApiOkResponseCustom({model: UserInfoDto})
  @Patch('/info')
  async updateInfo(
    @User() user: AuthUserDto,
    @Body() editDto: UpdateUserInfoDto
  ): Promise<OkResponseDto<UserInfoDto>> {
    //비밀번호 변경
    if (editDto.newPassword && editDto.currentPassword) {
      //현재 비밀번호 확인
      const isValidCurrentPassword = await this.userService.verifyPasswordByIdx(
        editDto.currentPassword,
        user.userIdx
      );
      if (!isValidCurrentPassword) {
        throw new BadRequestException('current password mismatch');
      }

      //비밀번호 수정
      await this.userService.changePassword(user.userIdx, editDto.newPassword);
    }

    //유저 정보 변경
    const userEntity = await this.userService.editInfo(user.userIdx, editDto);

    const resDto = new UserInfoDto(userEntity);

    return new OkResponseDto(resDto);
  }

  @ApiOperation({summary: 'OTP 등록을 위한 정보 요청'})
  @ApiOkResponseCustom({model: ResponseRegisterOtpDto})
  @Get('/otp/register')
  async registerOtp(@User() user: AuthUserDto): Promise<OkResponseDto<ResponseRegisterOtpDto>> {
    //OTP 등록 여부 확인
    if (user.useOtp == 'y' && user.otpSecret) {
      throw new BadRequestException('You have already registered OTP');
    }

    //OTP secret 생성
    const userEntity = await this.userService.getUser(user.userIdx);
    const otpSecret = await this.userService.createOtpSecret(userEntity);

    const resDto = new ResponseRegisterOtpDto({
      secret: otpSecret.secret,
      qrCodeImage: otpSecret.qrCodeImage,
    });

    return new OkResponseDto(resDto);
  }

  @ApiOperation({summary: 'OTP 등록 처리'})
  @ApiBody({type: RegisterOtpDto})
  @ApiOkResponseCustom({model: null})
  @Post('/otp/register')
  @HttpCode(200)
  async registerOtpProc(
    @User() user: AuthUserDto,
    @Body() registerDto: RegisterOtpDto
  ): Promise<OkResponseDto<null>> {
    //OTP 등록 여부 확인
    if (user.useOtp == 'y' && user.otpSecret) {
      throw new BadRequestException('You have already registered OTP');
    }

    //set vars: request
    const {secret: otpSecret, token: otpToken} = registerDto;

    //OTP 토큰 검증
    if (!this.authService.verifyOtpToken(otpToken, otpSecret)) {
      throw new BadRequestException('Invalid OTP token');
    }

    //OTP secret 저장
    await this.userService.upsertOtpSecret(user.userIdx, otpSecret);

    return new OkResponseDto();
  }

  @ApiOperation({summary: '등록된 OTP 해제'})
  @ApiBodyCustom({otpToken: {description: 'OTP 토큰'}}, ['otpToken'])
  @ApiOkResponseCustom({model: null})
  @Delete('/otp')
  async unregisterOtp(
    @User() user: AuthUserDto,
    @Body('otpToken', new RequiredPipe()) otpToken: string
  ): Promise<OkResponseDto<null>> {
    //OTP 사용 여부 확인
    if (user.useOtp != 'y') {
      throw new BadRequestException('You are not using OTP');
    }

    //OTP 토큰 검증
    if (!this.authService.verifyOtpToken(otpToken, user.otpSecret)) {
      throw new BadRequestException('Invalid OTP token');
    }

    //OTP secret 삭제
    await this.userService.deleteOtpSecret(user.userIdx);

    return new OkResponseDto();
  }
}
