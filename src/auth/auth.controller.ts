import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  LoggerService,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiTags} from '@nestjs/swagger';

import {User} from '@app/auth/auth.decorator';
import {AuthService} from '@app/auth/auth.service';
import {LocalAuthGuard} from '@app/auth/authGuard';
import {
  AuthUserDto,
  LoginSuccessDto,
  NeedOtpVerifyDto,
  ReissueTokenDto,
  UserCredentialDto,
  UserOtpCredentialDto,
} from '@app/auth/dto';
import {UserService} from '@app/user/service';
import {ApiBodyCustom, ApiOkResponseCustom} from '@common/decorator/swagger';
import {OkResponseDto} from '@common/dto';
import {RequiredPipe} from '@common/pipe';

@ApiTags('로그인/인증')
@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(Logger) private logger: LoggerService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  @ApiOperation({summary: '로그인'})
  @ApiBody({type: UserCredentialDto})
  @ApiOkResponseCustom({
    description: 'response는 두가지 타입이 있음',
    model: [LoginSuccessDto, NeedOtpVerifyDto],
  })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async login(
    @User() user: AuthUserDto
  ): Promise<OkResponseDto<LoginSuccessDto | NeedOtpVerifyDto>> {
    let responseDto: LoginSuccessDto | NeedOtpVerifyDto;

    //otp 사용 여부에 따라 response dto 다름
    if (user.useOtp == 'y') {
      responseDto = new NeedOtpVerifyDto(true);
    } else {
      const accessToken = this.authService.createAccessToken(user);
      const refreshToken = this.authService.createRefreshToken(user);

      responseDto = new LoginSuccessDto({
        accessToken,
        refreshToken,
        userIdx: user.userIdx,
        id: user.id,
        name: user.name,
        useOtp: user.useOtp,
      });
    }

    return new OkResponseDto(responseDto);
  }

  @ApiOperation({summary: 'OTP 인증'})
  @ApiBody({type: UserOtpCredentialDto})
  @ApiOkResponseCustom({model: LoginSuccessDto})
  @Post('/verify-otp')
  @HttpCode(200)
  async verifyOtp(
    @Body() credential: UserOtpCredentialDto
  ): Promise<OkResponseDto<LoginSuccessDto>> {
    //set vars: 유저 데이터
    const user = await this.authService.validateUser(credential.userId, credential.password);
    if (!user.userOtp) {
      throw new UnauthorizedException('OTP information not found');
    }

    //otp 토큰 검증
    if (!this.authService.verifyOtpToken(credential.token, user.userOtp.secret)) {
      throw new UnauthorizedException('Invalid OTP token');
    }

    //set vars: 액세스 토큰, 리프레시 토큰
    const accessToken = this.authService.createAccessToken(user);
    const refreshToken = this.authService.createRefreshToken(user);

    //insert login log
    await this.userService.insertLoginLog(user.user_idx, 'login');

    const resDto = new LoginSuccessDto({
      accessToken,
      refreshToken,
      userIdx: user.user_idx,
      id: user.id,
      name: user.name,
      useOtp: user.use_otp,
    });

    return new OkResponseDto(resDto);
  }

  @ApiOperation({summary: '액세스 토큰 재발급'})
  @ApiBodyCustom({refreshToken: {type: 'string', description: '리프레시 토큰'}}, ['refreshToken'])
  @ApiOkResponseCustom({model: ReissueTokenDto})
  @Post('/reissue-token')
  @HttpCode(200)
  async reissueToken(
    @Body('refreshToken', new RequiredPipe()) refreshToken: string
  ): Promise<OkResponseDto<ReissueTokenDto>> {
    //리프레시 토큰 검증
    const payload = this.authService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.uid) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    //액세스 토큰 새로 발급
    const userEntity = await this.authService.validateUserByUid(payload.uid);
    const accessToken = this.authService.createAccessToken(userEntity);

    const responseDto = new ReissueTokenDto();
    responseDto.accessToken = accessToken;

    return new OkResponseDto(responseDto);
  }
}
