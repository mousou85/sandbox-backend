import {Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {AuthModule} from '@app/auth/auth.module';
import {GroupController, ItemController} from '@app/invest/controller';
import {InvestGroupService, InvestItemService, InvestUnitService} from '@app/invest/service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [GroupController, ItemController],
  providers: [Logger, InvestGroupService, InvestItemService, InvestUnitService],
  exports: [],
})
export class InvestModule {}
