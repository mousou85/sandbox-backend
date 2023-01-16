import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ConfigModule as AppConfigModule} from '@config/config.module';
import {TypeOrmConfigService} from '@config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbModule} from '@db/db.module';
import {AppController} from '@app/app.controller';

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
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
