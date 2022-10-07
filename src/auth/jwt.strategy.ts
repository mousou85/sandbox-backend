import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {UserRepository} from "./repositories/user.repository";
import {JWTConfig} from "../configs/auth.config";
import {UserEntity} from "./entities/user.entity";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private _userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super({
      secretOrKey: JWTConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });

    this._userRepository = userRepository;
  }

  public async validate(payload): Promise<UserEntity>
  {
    const {username} = payload;
    const user = await this._userRepository.findOneBy({username});

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}