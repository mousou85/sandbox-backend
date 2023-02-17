import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  InvestGroupEntity,
  UserEntity,
  UserLoginLogEntity,
  UserOtpEntity,
  UserPasswordSaltEntity,
} from '@db/entity';
import {InvestGroupRepository, UserLoginLogRepository, UserRepository} from '@db/repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserLoginLogEntity,
      UserPasswordSaltEntity,
      UserOtpEntity,
      InvestGroupEntity,
    ]),
  ],
  controllers: [],
  providers: [UserRepository, UserLoginLogRepository, InvestGroupRepository],
  exports: [UserRepository, UserLoginLogRepository, InvestGroupRepository],
})
export class DbModule {}
