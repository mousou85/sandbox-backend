import {Logger, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {
  GroupController,
  HistoryController,
  ItemController,
  SummaryController,
  UnitController,
} from '@app/invest/controller';
import {
  InvestCompanyEntity,
  InvestGroupEntity,
  InvestGroupItemEntity,
  InvestHistoryEntity,
  InvestItemEntity,
  InvestSummaryDateEntity,
  InvestSummaryEntity,
  InvestUnitEntity,
  InvestUnitSetEntity,
} from '@app/invest/entity';
import {
  InvestGroupRepository,
  InvestHistoryRepository,
  InvestItemRepository,
  InvestSummaryDateRepository,
  InvestSummaryRepository,
  InvestUnitRepository,
} from '@app/invest/repository';
import {
  InvestGroupService,
  InvestHistoryService,
  InvestItemService,
  InvestSummaryService,
  InvestUnitService,
} from '@app/invest/service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestCompanyEntity,
      InvestGroupEntity,
      InvestGroupItemEntity,
      InvestHistoryEntity,
      InvestItemEntity,
      InvestSummaryEntity,
      InvestSummaryDateEntity,
      InvestUnitEntity,
      InvestUnitSetEntity,
    ]),
  ],
  controllers: [
    GroupController,
    ItemController,
    UnitController,
    HistoryController,
    SummaryController,
  ],
  providers: [
    Logger,
    InvestGroupRepository,
    InvestHistoryRepository,
    InvestItemRepository,
    InvestSummaryRepository,
    InvestSummaryDateRepository,
    InvestUnitRepository,
    InvestGroupService,
    InvestItemService,
    InvestUnitService,
    InvestHistoryService,
    InvestSummaryService,
  ],
  exports: [],
})
export class InvestModule {}
