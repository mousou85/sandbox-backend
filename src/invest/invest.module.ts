import {Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {AuthModule} from '@app/auth/auth.module';
import {GroupController} from '@app/invest/controller';
import {InvestGroupService} from '@app/invest/service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [GroupController],
  providers: [Logger, InvestGroupService],
  exports: [],
})
export class InvestModule {}
