import {Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {UserService} from '@app/user/service';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [Logger, UserService],
  exports: [UserService],
})
export class UserModule {}
