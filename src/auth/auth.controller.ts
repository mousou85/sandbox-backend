import {Body, Controller, HttpCode, Inject, Logger, LoggerService, Post} from '@nestjs/common';
import {AuthService} from '@app/auth/auth.service';
import {UserCredentialDto} from '@app/auth/dto';

@Controller('/auth')
export class AuthController {
  constructor(@Inject(Logger) private logger: LoggerService, private authService: AuthService) {}

  // @UseInterceptors(UserIpInterceptor)
  @Post('/login')
  @HttpCode(200)
  async login(@Body() userCredential: UserCredentialDto) {
    const {userId, password} = userCredential;

    //set vars: user entity
    const userEntity = await this.authService.validateUser(userId, password);
    console.log(this.authService.createAccessToken(userEntity));
    console.log(this.authService.createRefreshToken(userEntity));
    // console.log(HttpHelper.getHeaders(), HttpHelper.getHeader('accept'));
    // await this.authService.validateUser('mousou85@gmail.com', 'assas132');
  }
}
