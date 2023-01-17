import {NestFactory} from '@nestjs/core';
import {AppModule} from '@app/app.module';
import * as process from 'process';
import {createLogger} from '@common/logger';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  //set logger
  const logger = createLogger('NEST');

  //set app instance
  const app = await NestFactory.create(AppModule, {logger: logger});

  //set global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
