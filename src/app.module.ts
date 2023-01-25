import {Logger, MiddlewareConsumer, Module, NestModule, ValidationPipe} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ConfigModule as AppConfigModule} from '@config/config.module';
import {TypeOrmConfigService} from '@config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbModule} from '@db/db.module';
import {HttpLoggerMiddleware} from '@common/middleware';
import {APP_PIPE} from '@nestjs/core';
import {AuthModule} from '@app/auth/auth.module';
import {UserModule} from '@app/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useClass: TypeOrmConfigService,
      inject: [TypeOrmConfigService],
    }),
    DbModule,
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [Logger, {provide: APP_PIPE, useClass: ValidationPipe}],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //모든 라우터에 HTTP 접속 로거 미들웨어
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
