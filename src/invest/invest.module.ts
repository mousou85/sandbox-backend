import {Logger, Module} from '@nestjs/common';

import {AuthModule} from '@app/auth/auth.module';
import {GroupController, ItemController, UnitController} from '@app/invest/controller';
import {InvestGroupService, InvestItemService, InvestUnitService} from '@app/invest/service';
import {DbModule} from '@db/db.module';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [GroupController, ItemController, UnitController],
  providers: [Logger, InvestGroupService, InvestItemService, InvestUnitService],
  exports: [],
})
export class InvestModule {}
