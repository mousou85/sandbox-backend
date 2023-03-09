import {forwardRef, Logger, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {AuthModule} from '@app/auth/auth.module';
import {UserController} from '@app/user/controller';
import {
  UserEntity,
  UserLoginLogEntity,
  UserOtpEntity,
  UserPasswordSaltEntity,
} from '@app/user/entity';
import {UserLoginLogRepository, UserRepository} from '@app/user/repository';
import {UserService} from '@app/user/service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserLoginLogEntity,
      UserOtpEntity,
      UserPasswordSaltEntity,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [Logger, UserRepository, UserLoginLogRepository, UserService],
  exports: [UserRepository, UserLoginLogRepository, UserService],
})
export class UserModule {}
