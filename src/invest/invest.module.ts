import {Logger, Module} from '@nestjs/common';

import {AuthModule} from '@app/auth/auth.module';
import {
  GroupController,
  HistoryController,
  ItemController,
  UnitController,
} from '@app/invest/controller';
import {
  InvestGroupService,
  InvestHistoryService,
  InvestItemService,
  InvestSummaryService,
  InvestUnitService,
} from '@app/invest/service';
import {DbModule} from '@db/db.module';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [GroupController, ItemController, UnitController, HistoryController],
  providers: [
    Logger,
    InvestGroupService,
    InvestItemService,
    InvestUnitService,
    InvestHistoryService,
    InvestSummaryService,
  ],
  exports: [],
})
export class InvestModule {}
