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
import {LoginSuccessDto} from '@app/auth/dto';
import {OkResponseDto} from '@common/dto';
import {UserEntity} from '@db/entity';

@Controller('/auth')
export class AuthController {
  constructor(@Inject(Logger) private logger: LoggerService, private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async login(@User() user) {
    const accessToken = this.authService.createAccessToken(user);
    const refreshToken = this.authService.createRefreshToken(user);

    const loginSuccessDto = new LoginSuccessDto().fromInstance({
      accessToken,
      refreshToken,
      ...user,
    });

    return new OkResponseDto(loginSuccessDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/test')
  async test(@User() user: UserEntity) {}
}
