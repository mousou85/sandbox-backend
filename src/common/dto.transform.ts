import {CommonHelper} from '@common/helper';

export class DtoTransform {
  /**
   * trim
   */
  static trim(value: string): string {
    return !value ? value : value.trim();
  }

  /**
   * left trim
   */
  static lTrim(value: string): string {
    return !value ? value : CommonHelper.lTrim(value);
  }

  /**
   * right trim
   */
  static rTrim(value: string): string {
    return !value ? value : CommonHelper.rTrim(value);
  }

  /**
   * 정수 변환
   */
  static parseInt(value: string) {
    return !value ? value : parseInt(value);
  }

  /**
   * 실수 변환
   */
  static parseFloat(value: string, precision?: number) {
    if (!value) return value;
    let parseValue = parseFloat(value);
    return precision > 0 ? parseFloat(parseValue.toFixed(precision)) : parseValue;
  }

  /**
   * 소문자 변환
   */
  static lowerCase(value: string): string {
    return !value ? value : value.toLowerCase();
  }

  /**
   * 대문자 변환
   */
  static upperCase(value: string): string {
    return !value ? value : value.toUpperCase();
  }
}
