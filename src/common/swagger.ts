import {INestApplication} from '@nestjs/common';
import {swaggerConfig} from '@config';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export const enableSwaggerModule = (app: INestApplication) => {
  for (const item of swaggerConfig) {
    const builder = new DocumentBuilder()
      .setTitle(item.title)
      .setDescription(item.description)
      .setVersion(item.version)
      .addBearerAuth();

    const document = SwaggerModule.createDocument(app, builder.build(), {
      include: item.includeModules,
    });

    SwaggerModule.setup(item.urlPrefix, app, document, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
      },
    });
  }
};
