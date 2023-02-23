import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  InvestGroupEntity,
  InvestItemEntity,
  InvestUnitEntity,
  InvestUnitSetEntity,
  UserEntity,
  UserLoginLogEntity,
  UserOtpEntity,
  UserPasswordSaltEntity,
} from '@db/entity';
import {
  InvestGroupRepository,
  InvestItemRepository,
  InvestUnitRepository,
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
      InvestUnitEntity,
      InvestUnitSetEntity,
    ]),
  ],
  controllers: [],
  providers: [
    UserRepository,
    UserLoginLogRepository,
    InvestGroupRepository,
    InvestItemRepository,
    InvestUnitRepository,
  ],
  exports: [
    UserRepository,
    UserLoginLogRepository,
    InvestGroupRepository,
    InvestItemRepository,
    InvestUnitRepository,
  ],
})
export class DbModule {}
