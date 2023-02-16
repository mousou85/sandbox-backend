import {Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {AuthModule} from '@app/auth/auth.module';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [],
  providers: [Logger],
  exports: [],
})
export class InvestModule {}
