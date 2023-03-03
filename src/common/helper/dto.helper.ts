import {BadRequestException} from '@nestjs/common';
import {
  ClassTransformOptions,
  instanceToPlain,
  plainToClassFromExist,
  plainToInstance,
} from 'class-transformer';
import {validate, ValidatorOptions} from 'class-validator';

/**
 * DTO 헬퍼
 */
export class DtoHelper {
  /**
   * DTO 유효성 검증을 실행 후 에러가 있으면 BadRequestException을 실행
   * @param obj
   * @param validatorOptions
   */
  static async validate(obj: object, validatorOptions?: ValidatorOptions): Promise<void> {
    const errors = await validate(obj, validatorOptions);

    if (Array.isArray(errors) && errors.length) {
      const errorMsgs = [];
      for (const err of errors) {
        const {constraints} = err;
        for (const key of Object.keys(constraints)) {
          errorMsgs.push(constraints[key]);
        }
      }

      throw new BadRequestException(errorMsgs);
    }
  }

  /**
   * 객체의 키를 카멜케이스로 변환 및 plain 시킨후 반환
   * @param obj
   */
  static keyToCamelCase(obj: any): any {
    if (obj === undefined || obj === null) return obj;
    if (typeof obj != 'object') return obj;
    if (!Object.keys(obj).length) return obj;

    let plain = Array.isArray(obj) ? [] : {};
    for (let [key, value] of Object.entries(obj)) {
      key = key.replace(/_([a-z])/g, (matchStr) => {
        return matchStr.replace('_', '').toUpperCase();
      });

      if (Array.isArray(plain)) {
        plain.push(DtoHelper.keyToCamelCase(value));
      } else {
        plain[key] = DtoHelper.keyToCamelCase(value);
      }
    }

    return plain;
  }

  /**
   * dto로 변환 후 반환
   * @param obj 변환할 객체
   * @param dtoCls DTO class
   * @param [opts] 옵션
   * @param [opts.keyToCamelCase=true] 키를 카멜케이스로 변환
   */
  static transformForDto<T>(
    obj: any,
    dtoCls: new () => T,
    opts: {keyToCamelCase: boolean} & ClassTransformOptions = {
      keyToCamelCase: true,
      excludeExtraneousValues: true,
    }
  ): T {
    let plain = instanceToPlain(obj);
    if (opts?.keyToCamelCase) {
      plain = this.keyToCamelCase(plain);
    }
    return plainToInstance(dtoCls, plain, opts);
  }

  /**
   * 인자로 받은 dto 인스턴스에 객체 값을 할당
   * @param obj 변환할 객체
   * @param dtoInstance DTO class
   * @param [opts] 옵션
   * @param [opts.keyToCamelCase=true] 키를 카멜케이스로 변환
   */
  static transformForExistsDto<T>(
    obj: any,
    dtoInstance: T,
    opts: {keyToCamelCase: boolean} & ClassTransformOptions = {
      keyToCamelCase: true,
      excludeExtraneousValues: true,
    }
  ) {
    let plain = instanceToPlain(obj);
    if (opts?.keyToCamelCase) {
      plain = this.keyToCamelCase(plain);
    }

    plainToClassFromExist(dtoInstance, plain, opts);
  }
}
