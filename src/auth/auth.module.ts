import {Logger, Module} from '@nestjs/common';
import {DbModule} from '@db/db.module';
import {UserModule} from '@app/user/user.module';
import {AuthController} from '@app/auth/auth.controller';
import {AuthService} from '@app/auth/auth.service';

@Module({
  imports: [DbModule, UserModule],
  controllers: [AuthController],
  providers: [Logger, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
