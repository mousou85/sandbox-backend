import {Controller, LoggerService} from '@nestjs/common';

@Controller('/auth')
export class AuthController {
  constructor(private logger: LoggerService) {}
}
