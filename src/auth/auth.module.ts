import {Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {UserModule} from '@app/user/user.module';
import {AuthController} from '@app/auth/auth.controller';
import {AuthService} from '@app/auth/auth.service';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule as AppConfigModule} from '@config/config.module';
import {JwtStrategy} from '@app/auth/strategy';
import {ConfigType} from '@nestjs/config';
import {jwtConfig} from '@config/jwt.config';

@Module({
  imports: [
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
    }),
    DbModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
