import {applyDecorators} from '@nestjs/common';
import {ApiBody, ApiBodyOptions} from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * swagger api 커스텀 body
 */
export const ApiBodyCustom = (
  properties: Record<string, SchemaObject | ReferenceObject>,
  requiredProperties?: string[]
): MethodDecorator => {
  const options: ApiBodyOptions = {
    schema: {
      type: 'object',
      properties: properties,
    },
  };

  if (requiredProperties && requiredProperties.length) {
    options.schema['required'] = requiredProperties;
  }

  return applyDecorators(ApiBody(options));
};
