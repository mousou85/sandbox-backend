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
  //set vars: 적용할 데코레이터 목록
  const decoratorList = [];
  decoratorList.push(ApiExtraModels(OkResponseDto));

  //ApiOkResponse 데코레이터 옵션
  let apiOptions: ApiResponseOptions = {
    schema: {
      allOf: [{$ref: getSchemaPath(OkResponseDto)}],
      oneOf: [],
    },
  };
  if (options?.description) {
    apiOptions.description = options.description;
  }
  if (options?.model) {
    if (Array.isArray(options.model)) {
      for (const model of options.model) {
        decoratorList.push(ApiExtraModels(model));
        apiOptions.schema.oneOf.push({
          properties: {data: {$ref: getSchemaPath(model)}},
        });
      }
    } else {
      decoratorList.push(ApiExtraModels(options.model));
      apiOptions.schema.allOf.push({
        properties: {data: {$ref: getSchemaPath(options.model)}},
      });
    }
  }

  decoratorList.push(ApiOkResponseDefault(apiOptions));
  return applyDecorators(...decoratorList);
};
