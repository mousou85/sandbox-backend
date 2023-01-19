import {Controller, LoggerService} from '@nestjs/common';

@Controller('/user')
export class UserController {
  constructor(private logger: LoggerService) {}
}
