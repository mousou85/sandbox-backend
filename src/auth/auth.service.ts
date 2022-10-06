import { Injectable } from '@nestjs/common';
import {UserRepository} from "./repositories/user.repository";
import {CreateUserDto} from "./dto/CreateUser.dto";
import {UserEntity} from "./entities/user.entity";

@Injectable()
export class AuthService {
  private _userRepository: UserRepository;

  constructor(userRepository: UserRepository)
  {
    this._userRepository = userRepository;
  }

  public async createUser(createUserDto: CreateUserDto): Promise<UserEntity>
  {
    return this._userRepository.createUser(createUserDto);
  }
}
