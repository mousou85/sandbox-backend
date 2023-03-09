import {forwardRef, Logger, Module} from '@nestjs/common';
import {ConfigType} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';

import {AuthController} from '@app/auth/auth.controller';
import {AuthService} from '@app/auth/auth.service';
import {JwtStrategy, LocalStrategy} from '@app/auth/strategy';
import {UserModule} from '@app/user/user.module';
import {ConfigModule as AppConfigModule, jwtConfig} from '@config';

@Module({
  imports: [
    PassportModule,
    forwardRef(() =>
      JwtModule.registerAsync({
        imports: [AppConfigModule],
        inject: [jwtConfig.KEY],
        useFactory: (config: ConfigType<typeof jwtConfig>) => {
          return {
            secret: config.accessTokenSecret,
            signOptions: {
              algorithm: config.accessTokenAlgorithm,
              issuer: config.issuer,
              expiresIn: config.accessTokenExpire,
            },
          };
        },
      })
    ),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
