import {Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [Logger],
  exports: [],
})
export class AuthModule {}
