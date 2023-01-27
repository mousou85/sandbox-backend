import {Controller, Inject, Logger, LoggerService, Post} from '@nestjs/common';
import {AuthService} from '@app/auth/auth.service';

@Controller('/auth')
export class AuthController {
  constructor(@Inject(Logger) private logger: LoggerService, private authService: AuthService) {}

  // @UseInterceptors(UserIpInterceptor)
  @Post('/login')
  async login() {
    // console.log(HttpHelper.getHeaders(), HttpHelper.getHeader('accept'));
    // await this.authService.validateUser('mousou85@gmail.com', 'assas132');
  }
}
