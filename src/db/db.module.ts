import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {
  InvestGroupEntity,
  InvestHistoryEntity,
  InvestItemEntity,
  InvestSummaryDateEntity,
  InvestSummaryEntity,
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
  InvestSummaryDateRepository,
  InvestSummaryRepository,
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
      InvestSummaryEntity,
      InvestSummaryDateEntity,
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
    InvestSummaryRepository,
    InvestSummaryDateRepository,
  ],
  exports: [
    UserRepository,
    UserLoginLogRepository,
    InvestGroupRepository,
    InvestItemRepository,
    InvestUnitRepository,
    InvestHistoryRepository,
    InvestSummaryRepository,
    InvestSummaryDateRepository,
  ],
})
export class DbModule {}
