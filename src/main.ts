import * as process from 'process';

import {ClassSerializerInterceptor, ValidationPipe} from '@nestjs/common';
import {NestFactory, Reflector} from '@nestjs/core';
import {ClsMiddleware} from 'nestjs-cls';

import {AppModule} from '@app/app.module';
import {GlobalExceptionFilter} from '@common/global';
import {createLogger} from '@common/logger';
import {clsIdGenerator, clsMiddlewareSetup} from '@common/middleware/cls.middleware';
import {enableSwaggerModule} from '@common/swagger';

declare const module: any;

async function bootstrap() {
  //set logger
  const logger = createLogger('NEST');

  //set app instance
  const app = await NestFactory.create(AppModule, {logger: logger});

  //set cls middleware
  app.use(
    new ClsMiddleware({
      setup: clsMiddlewareSetup,
      generateId: true,
      idGenerator: clsIdGenerator,
    }).use
  );

  //set global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    })
  );

  //set global filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  //set global class serialize interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //enable swagger module
  if (process.env.NODE_ENV == 'development') {
    enableSwaggerModule(app);
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
