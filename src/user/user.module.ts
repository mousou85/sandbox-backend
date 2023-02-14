import {forwardRef, Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {UserService} from '@app/user/service';
import {UserController} from '@app/user/controller';
import {AuthModule} from '@app/auth/auth.module';

@Module({
  imports: [DbModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [Logger, UserService],
  exports: [UserService],
})
export class UserModule {}
