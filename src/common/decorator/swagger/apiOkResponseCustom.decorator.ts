import {applyDecorators, Type} from '@nestjs/common';
import {OkResponseDto} from '@common/dto';
import {ApiExtraModels, ApiOkResponse, ApiResponseOptions, getSchemaPath} from '@nestjs/swagger';

/**
 * swagger 성공 결과 값 데코레이터
 */
export const ApiOkResponseCustom = <T extends Type<any>>(options?: {
  description?: string;
  model?: T | T[];
}): MethodDecorator => {
  const {description, model} = options;

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

  decoratorList.push(ApiOkResponse(apiOptions));
  return applyDecorators(...decoratorList);
};