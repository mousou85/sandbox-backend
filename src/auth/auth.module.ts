import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {UserRepository} from "./repositories/user.repository";
import {JwtModule} from "@nestjs/jwt";
import {JWTConfig, PassportConfig} from "../configs/auth.config";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register(JWTConfig),
    PassportModule.register(PassportConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserRepository,
  ],
  exports: [
    JwtStrategy,
    PassportModule
  ],
})
export class AuthModule {}
