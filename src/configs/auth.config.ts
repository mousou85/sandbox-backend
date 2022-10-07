import {JwtModuleOptions} from "@nestjs/jwt";
import {IAuthModuleOptions} from "@nestjs/passport";

export const JWTConfig: JwtModuleOptions = {
  secret: 'test1234',
  signOptions: {expiresIn: '1h'}
}

export const PassportConfig: IAuthModuleOptions = {
  defaultStrategy: 'jwt',
}