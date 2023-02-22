import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  InvestGroupEntity,
  InvestItemEntity,
  UserEntity,
  UserLoginLogEntity,
  UserOtpEntity,
  UserPasswordSaltEntity,
} from '@db/entity';
import {
  InvestGroupRepository,
  InvestItemRepository,
  UserLoginLogRepository,
  UserRepository,
} from '@db/repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserLoginLogEntity,
      UserPasswordSaltEntity,
      UserOtpEntity,
      InvestGroupEntity,
      InvestItemEntity,
    ]),
  ],
  controllers: [],
  providers: [UserRepository, UserLoginLogRepository, InvestGroupRepository, InvestItemRepository],
  exports: [UserRepository, UserLoginLogRepository, InvestGroupRepository, InvestItemRepository],
})
export class DbModule {}
