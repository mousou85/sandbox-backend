import {Logger, MiddlewareConsumer, Module, NestModule, ValidationPipe} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ConfigModule as AppConfigModule} from '@config/config.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbModule} from '@db/db.module';
import {HttpLoggerMiddleware} from '@common/middleware';
import {APP_PIPE} from '@nestjs/core';
import {AuthModule} from '@app/auth/auth.module';
import {UserModule} from '@app/user/user.module';
import {ClsModule} from 'nestjs-cls';
import {TypeOrmOptionService} from '@config/service';
import {jwtConfig, typeOrmConfig} from '@config';

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
