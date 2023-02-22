import {applyDecorators, Type} from '@nestjs/common';
import {ListResponseDto} from '@common/dto';
import {ApiExtraModels, ApiOkResponse, ApiResponseOptions, getSchemaPath} from '@nestjs/swagger';

/**
 * swagger 성공 결과 값 데코레이터
 */
export const ApiListResponse = <T extends Type>(options?: {
  description?: string;
  model: T | T[];
}): MethodDecorator => {
  const {description, model} = options;

  //set vars: 적용할 데코레이터 목록
  const decoratorList = [];
  decoratorList.push(ApiExtraModels(ListResponseDto));

  //response 데이터중 list 속성 정의
  let listProperty = {};
  if (Array.isArray(model)) {
    decoratorList.push(ApiExtraModels(...model));

    listProperty['oneOf'] = [];
    for (const item of model) {
      listProperty['oneOf'].push({$ref: getSchemaPath(item)});
    }
  } else {
    decoratorList.push(ApiExtraModels(model));

    listProperty['allOf'] = [{$ref: getSchemaPath(model)}];
  }

  //set vars: ApiOkResponse 데코레이터 옵션
  let apiOptions: ApiResponseOptions = {
    description: description ?? null,
    schema: {
      allOf: [
        {$ref: getSchemaPath(ListResponseDto)},
        {
          properties: {
            data: {
              properties: {
                totalCount: {
                  type: 'number',
                  description: '총 데이터 수',
                },
                totalPage: {
                  type: 'number',
                  description: '총 페이지 수',
                },
                list: {
                  type: 'array',
                  items: {...listProperty},
                },
              },
              required: ['list'],
            },
          },
        },
      ],
    },
  };

  decoratorList.push(ApiOkResponse(apiOptions));
  return applyDecorators(...decoratorList);
};
