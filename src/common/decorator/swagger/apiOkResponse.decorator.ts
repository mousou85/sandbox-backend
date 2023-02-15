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

  //set vars: ApiOkResponse 데코레이터 옵션
  let apiOptions: ApiResponseOptions = {
    schema: {
      allOf: [{$ref: getSchemaPath(OkResponseDto)}],
    },
  };

  //설명 추가
  if (description) apiOptions.description = description;

  //response 데이터중 data 속성 정의
  if (model) {
    let schemaProperties = {data: {}};

    if (Array.isArray(model)) {
      schemaProperties.data['oneOf'] = [];

      for (const item of model) {
        decoratorList.push(ApiExtraModels(item));
        schemaProperties.data['oneOf'].push({$ref: getSchemaPath(item)});
      }
    } else {
      schemaProperties.data['allOf'] = [];

      decoratorList.push(ApiExtraModels(model));
      schemaProperties.data['allOf'].push({$ref: getSchemaPath(model)});
    }

    apiOptions.schema['properties'] = schemaProperties;
  }

  decoratorList.push(ApiOkResponseDefault(apiOptions));
  return applyDecorators(...decoratorList);
};
