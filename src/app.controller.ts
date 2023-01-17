import {Controller, Get} from '@nestjs/common';
import {UserRepository} from '@db/repository';
import {v4 as uuidV4} from 'uuid';

@Controller()
export class AppController {
  constructor(private userRepository: UserRepository) {}

  @Get()
  async getHello() {
    console.log(uuidV4());
    const test = await this.userRepository.findAllByCondition({});
    console.log(test);
  }
}
