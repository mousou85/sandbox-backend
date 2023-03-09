import {applyDecorators, Type} from '@nestjs/common';
import {ApiExtraModels, ApiOkResponse, ApiResponseOptions, getSchemaPath} from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import {OkResponseDto} from '@common/dto';

/**
 * swagger 성공 결과 값 데코레이터
 */
export const ApiOkResponseCustom = <T extends Type<any>>(options?: {
  description?: string;
  model?: T | T[];
  customProperties?: Record<string, SchemaObject | ReferenceObject>;
}): MethodDecorator => {
  const {description, model, customProperties} = options;

  //set vars: 적용할 데코레이터 목록
  const decoratorList = [];
  decoratorList.push(ApiExtraModels(OkResponseDto));

  //set vars: ApiOkResponse 데코레이터 옵션
  let apiOptions: ApiResponseOptions = {
    description: description ?? null,
    schema: {
      allOf: [{$ref: getSchemaPath(OkResponseDto)}],
    },
  };

  //response 데이터중 data 속성 정의
  if (model) {
    let dataProperty = {properties: {data: {}}};

    if (Array.isArray(model)) {
      decoratorList.push(ApiExtraModels(...model));

      dataProperty.properties.data['oneOf'] = [];
      for (const item of model) {
        dataProperty.properties.data['oneOf'].push({$ref: getSchemaPath(item)});
      }
    } else {
      decoratorList.push(ApiExtraModels(model));
      dataProperty.properties.data['allOf'] = [{$ref: getSchemaPath(model)}];
    }

    apiOptions.schema.allOf.push(dataProperty);
  }
  if (customProperties) {
    apiOptions.schema.allOf.push({properties: {data: {properties: customProperties}}});
  }

  decoratorList.push(ApiOkResponse(apiOptions));
  return applyDecorators(...decoratorList);
};
