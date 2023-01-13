import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ConfigModule as AppConfigModule} from '@config/config.module';
import {TypeOrmConfigService} from '@config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbModule} from '@db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useClass: TypeOrmConfigService,
      inject: [TypeOrmConfigService],
    }),
    DbModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
