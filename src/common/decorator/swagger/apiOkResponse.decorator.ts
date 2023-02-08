import {applyDecorators, Type} from '@nestjs/common';
import {OkResponseDto} from '@common/dto';
import {
  ApiExtraModels,
  ApiOkResponse as ApiOkResponseDefault,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * swagger 성공 결과 값 데코레이터
 */
export const ApiOkResponse = <T extends Type>(options?: {
  description?: string;
  model?: T | T[];
}): MethodDecorator => {
  const {description, model} = options;

  //set vars: 적용할 데코레이터 목록
  const decoratorList = [];
  decoratorList.push(ApiExtraModels(OkResponseDto));

  //ApiOkResponse 데코레이터 옵션
  let apiOptions: ApiResponseOptions = {
    schema: {
      allOf: [{$ref: getSchemaPath(OkResponseDto)}],
      properties: {
        data: {},
      },
    },
  };

  if (description) {
    apiOptions.description = description;
  }
  if (model) {
    if (Array.isArray(model)) {
      apiOptions.schema.properties.data['oneOf'] = [];

      for (const item of model) {
        decoratorList.push(ApiExtraModels(item));
        apiOptions.schema.properties.data['oneOf'].push({$ref: getSchemaPath(item)});
      }
    } else {
      apiOptions.schema.properties.data['allOf'] = [];

      decoratorList.push(ApiExtraModels(model));
      apiOptions.schema.properties.data['allOf'].push({$ref: getSchemaPath(model)});
    }
  }

  decoratorList.push(ApiOkResponseDefault(apiOptions));
  return applyDecorators(...decoratorList);
};
