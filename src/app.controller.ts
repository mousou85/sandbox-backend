import {Controller, Get} from '@nestjs/common';
import {UserRepository} from '@db/repository';

@Controller()
export class AppController {
  constructor(private userRepository: UserRepository) {}

  @Get()
  async getHello() {}
}
