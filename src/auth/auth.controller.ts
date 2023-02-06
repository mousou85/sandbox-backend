import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  LoggerService,
  Post,
  UseGuards,
} from '@nestjs/common';
import {AuthService} from '@app/auth/auth.service';
import {JwtAuthGuard, LocalAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {LoginSuccessDto, NeedOtpVerifyDto, UserCredentialDto} from '@app/auth/dto';
import {OkResponseDto} from '@common/dto';
import {UserEntity} from '@db/entity';
import {ApiBody, ApiOperation} from '@nestjs/swagger';
import {ApiOkResponse} from '@common/decorator/swagger';

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

  @UseGuards(JwtAuthGuard)
  @Get('/test')
  async test(@User() user: UserEntity) {}
}
