import {Controller, Get, Inject, Logger, LoggerService} from '@nestjs/common';
import {AuthService} from '@app/auth/auth.service';

@Controller('/auth')
export class AuthController {
  constructor(@Inject(Logger) private logger: LoggerService, private authService: AuthService) {}

  @Get('/')
  async test() {
  }
}
