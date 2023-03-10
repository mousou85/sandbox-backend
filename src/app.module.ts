import process from 'process';

import {
  forwardRef,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_PIPE} from '@nestjs/core';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ClsModule} from 'nestjs-cls';

import {AuthModule} from '@app/auth/auth.module';
import {InvestModule} from '@app/invest/invest.module';
import {UserModule} from '@app/user/user.module';
import {HttpLoggerMiddleware} from '@common/middleware';
import {
  ConfigModule as AppConfigModule,
  jwtConfig,
  typeOrmConfig,
  TypeOrmOptionService,
} from '@config';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, load: [typeOrmConfig, jwtConfig]}),
    ClsModule.forRoot({
      global: true,
      // middleware: {mount: true},
    }),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useClass: TypeOrmOptionService,
      inject: [TypeOrmOptionService],
    }),
    forwardRef(() => AuthModule),
    UserModule,
    InvestModule,
  ],
  controllers: [],
  providers: [Logger, {provide: APP_PIPE, useClass: ValidationPipe}],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //모든 라우터에 HTTP 접속 로거 미들웨어
    if (process.env.LOGGER_HTTP === 'true') {
      consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
  }
}
