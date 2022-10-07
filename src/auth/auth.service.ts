import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UserRepository} from "./repositories/user.repository";
import {UserCredentialDto} from "./dto/userCredentialDto";
import {UserEntity} from "./entities/user.entity";
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
  private _userRepository: UserRepository;
  private _jwtService: JwtService

  constructor(userRepository: UserRepository, jwtService: JwtService)
  {
    this._userRepository = userRepository;
    this._jwtService = jwtService;
  }

  public async createUser(userCredentialDto: UserCredentialDto): Promise<UserEntity>
  {
    return this._userRepository.createUser(userCredentialDto);
  }

  public async login(userCredentialDto: UserCredentialDto): Promise<{accessToken: string}>
  {
    const {username, password} = userCredentialDto;
    const user = await this._userRepository.findOneBy({username});

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = {username};
      const accessToken = this._jwtService.sign(payload);

      return {accessToken};
    } else {
      throw new UnauthorizedException('login failed');
    }
  }
}
