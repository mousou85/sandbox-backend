import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {ApiBody, ApiBodyOptions} from '@nestjs/swagger';

/**
 * swagger api 커스텀 body
 */
export const ApiCustomBody =
  (
    properties: Record<string, SchemaObject | ReferenceObject>,
    requiredProperties?: string[]
  ): MethodDecorator =>
  (target, propertyKey, descriptor) => {
    let options: ApiBodyOptions = {
      schema: {
        type: 'object',
        properties: properties,
      },
    };

    if (requiredProperties && requiredProperties.length) {
      options.schema['required'] = requiredProperties;
    }

    ApiBody(options)(target, propertyKey, descriptor);
  };
