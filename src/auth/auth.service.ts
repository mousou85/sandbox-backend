import {Injectable} from '@nestjs/common';
import {UserRepository} from '@db/repository';

@Injectable()
export class AuthService {
  constructor(protected userRepository: UserRepository) {}
}
