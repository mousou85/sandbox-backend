import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserEntity, UserLoginLogEntity} from '@db/entity';
import {UserLoginLogRepository, UserRepository} from '@db/repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserLoginLogEntity])],
  controllers: [],
  providers: [UserRepository, UserLoginLogRepository],
  exports: [UserRepository, UserLoginLogRepository],
})
export class DbModule {}
