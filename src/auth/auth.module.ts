import {forwardRef, Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {UserModule} from '@app/user/user.module';
import {AuthController} from '@app/auth/auth.controller';
import {AuthService} from '@app/auth/auth.service';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule as AppConfigModule} from '@config/config.module';
import {JwtStrategy, LocalStrategy} from '@app/auth/strategy';
import {ConfigType} from '@nestjs/config';
import {jwtConfig} from '@config/jwt.config';
import {PassportModule} from '@nestjs/passport';

@Module({
  imports: [
    DbModule,
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
    UserModule,
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
