import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserEntity} from '@db/entity';
import {UserRepository} from '@db/repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class DbModule {}
