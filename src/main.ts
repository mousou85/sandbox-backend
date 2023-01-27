import {NestFactory} from '@nestjs/core';
import {AppModule} from '@app/app.module';
import * as process from 'process';
import {createLogger} from '@common/logger';
import {ValidationPipe} from '@nestjs/common';
import {GlobalExceptionFilter} from '@common/global';
import {ClsMiddleware} from 'nestjs-cls';
import {clsIdGenerator, clsMiddlewareSetup} from '@common/middleware/cls.middleware';

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

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
