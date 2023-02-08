import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  LoggerService,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {AuthService} from '@app/auth/auth.service';
import {JwtAuthGuard, LocalAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {
  LoginSuccessDto,
  NeedOtpVerifyDto,
  ReissueTokenResponseDto,
  UserCredentialDto,
} from '@app/auth/dto';
import {OkResponseDto} from '@common/dto';
import {UserEntity} from '@db/entity';
import {ApiBody, ApiOperation, ApiTags} from '@nestjs/swagger';
import {ApiCustomBody, ApiOkResponse} from '@common/decorator/swagger';
import {RequiredPipe} from '@common/pipe';

@ApiTags('로그인/인증')
@Controller('/auth')
export class AuthController {
  constructor(@Inject(Logger) private logger: LoggerService, private authService: AuthService) {}

  @ApiOperation({summary: '로그인'})
  @ApiBody({type: UserCredentialDto})
  @ApiOkResponse({
    description: 'response는 두가지 타입이 있음',
    model: [LoginSuccessDto, NeedOtpVerifyDto],
  })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async login(
    @User() user: UserEntity
  ): Promise<OkResponseDto<LoginSuccessDto | NeedOtpVerifyDto>> {
    let responseDto: LoginSuccessDto | NeedOtpVerifyDto;

    //otp 사용 여부에 따라 response dto 다름
    if (user.use_otp == 'y') {
      responseDto = new NeedOtpVerifyDto();
      responseDto.needOTPVerify = true;
    } else {
      const accessToken = this.authService.createAccessToken(user);
      const refreshToken = this.authService.createRefreshToken(user);

      responseDto = new LoginSuccessDto().fromInstance({
        accessToken,
        refreshToken,
        ...user,
      });
    }

    return new OkResponseDto(responseDto);
  }

  @ApiOperation({summary: '액세스 토큰 재발급'})
  @ApiCustomBody({refreshToken: {type: 'string', description: '리프레시 토큰'}}, ['refreshToken'])
  @ApiOkResponse({model: ReissueTokenResponseDto})
  @Post('/reissue-token')
  @HttpCode(200)
  async reissueToken(
    @Body('refreshToken', new RequiredPipe()) refreshToken: string
  ): Promise<OkResponseDto<ReissueTokenResponseDto>> {
    const payload = this.authService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.uid) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const userEntity = await this.authService.validateUserByUid(payload.uid);
    const accessToken = this.authService.createAccessToken(userEntity);

    const responseDto = new ReissueTokenResponseDto();
    responseDto.accessToken = accessToken;

    return new OkResponseDto(responseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/test')
  async test(@User() user: UserEntity) {}
}
