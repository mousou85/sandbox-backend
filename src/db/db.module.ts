import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {
  InvestGroupEntity,
  InvestHistoryEntity,
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
  InvestHistoryRepository,
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
      InvestHistoryEntity,
    ]),
  ],
  controllers: [],
  providers: [
    UserRepository,
    UserLoginLogRepository,
    InvestGroupRepository,
    InvestItemRepository,
    InvestUnitRepository,
    InvestHistoryRepository,
  ],
  exports: [
    UserRepository,
    UserLoginLogRepository,
    InvestGroupRepository,
    InvestItemRepository,
    InvestUnitRepository,
    InvestHistoryRepository,
  ],
})
export class DbModule {}
