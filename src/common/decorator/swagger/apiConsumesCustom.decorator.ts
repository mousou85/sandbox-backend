import {applyDecorators} from '@nestjs/common';
import {ApiConsumes} from '@nestjs/swagger';

/**
 * swagger api 커스텀 body
 * @param [mimeTypes=['application/x-www-form-urlencoded', 'application/json']] mime types
 */
export const ApiConsumesCustom = (...mimeTypes: string[]): MethodDecorator & ClassDecorator => {
  if (!mimeTypes.length) {
    mimeTypes = ['application/x-www-form-urlencoded', 'application/json'];
  }

  return applyDecorators(ApiConsumes(...mimeTypes));
};
