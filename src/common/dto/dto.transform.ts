import {isEmpty} from 'class-validator';
import dayjs from 'dayjs';

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
  static parseInt(value: string): number {
    return isEmpty(value) ? undefined : parseInt(value);
  }

  /**
   * 실수 변환
   */
  static parseFloat(value: string, precision?: number): number {
    if (isEmpty(value)) return undefined;
    let parseValue = parseFloat(value);
    return precision > 0 ? parseFloat(parseValue.toFixed(precision)) : parseValue;
  }

  /**
   * 날짜 포맷 변경
   * @param value
   * @param format 날짜 포맷(default: YYYY-MM-DD HH:mm:ss)
   */
  static parseDate(value: any, format = 'YYYY-MM-DD HH:mm:ss'): string {
    if (isEmpty(value)) return undefined;
    return dayjs(value).format(format);
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
