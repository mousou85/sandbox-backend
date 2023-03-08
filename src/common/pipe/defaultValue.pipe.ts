import {
  ArgumentMetadata,
  DefaultValuePipe as OriginalDefaultValuePipe,
  Injectable,
} from '@nestjs/common';

/**
 * 기본값 지정 파이프
 */
@Injectable()
export class DefaultValuePipe extends OriginalDefaultValuePipe {
  private readonly includeEmptyString: boolean;

  /**
   * 기본값 지정 파이프.
   * 인자로 넘어온 값이 undefined/null인 경우 기본값을 반환.
   * @param defaultValue 기본값
   * @param [includeEmptyString=true] 빈문자열('')도 undefined/null과 동일하게 취급할지 여부
   */
  constructor(defaultValue: any, includeEmptyString: boolean = true) {
    super(defaultValue);
    this.includeEmptyString = includeEmptyString;
  }

  transform(value?: any, _metadata?: ArgumentMetadata): any {
    if (this.includeEmptyString && typeof value == 'string' && value === '') {
      return this.defaultValue;
    } else {
      return super.transform(value, _metadata);
    }
  }
}
