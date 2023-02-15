import {
  ClassTransformOptions,
  instanceToPlain,
  plainToClassFromExist,
  plainToInstance,
} from 'class-transformer';

/**
 * DTO 헬퍼
 */
export class DtoHelper {
  /**
   * 객체의 키를 카멜케이스로 변환 및 plain 시킨후 반환
   * @param obj
   */
  static keyToCamelCase(obj: any): any {
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
