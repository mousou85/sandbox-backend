import {isDefined} from 'class-validator';

export class CommonHelper {
  /**
   * sql page offset 반환
   * @param page 페이지 번호
   * @param pageSize 페이지당 목록수
   */
  static getPageOffset(page: number, pageSize: number): number {
    page = page < 1 ? 1 : page;
    return (page - 1) * pageSize;
  }

  /**
   * total page 반환
   * @param totalCount 총 갯수
   * @param pageSize 페이지당 목록수
   */
  static getTotalPage(totalCount: number, pageSize: number): number {
    return Math.ceil(totalCount / pageSize);
  }

  /**
   * left trim 처리
   */
  static lTrim(value: string): string {
    return value.replace(/^\s+/, '');
  }

  /**
   * right trim 처리
   */
  static rTrim(value: string): string {
    return value.replace(/\s+$/, '');
  }

  /**
   * 문자열 안의 공백을 제거
   */
  static stripSpace(value: string): string {
    return value.replace(/\s/g, '');
  }

  /**
   * 문자열의 첫문자 대문자로 변경
   * @param str 문자열
   * @param everyWord 모든 단어의 첫번째 문자 대문자로 변경 여부
   */
  static capitalizeFirstLetter(str: string, everyWord: boolean = false): string {
    if (!isDefined(str) || str === '') return str;

    if (everyWord) {
      const strArr = str.split(' ');
      strArr.forEach((val, i) => {
        strArr[i] = val.charAt(0).toUpperCase() + val.slice(1);
      });
      return strArr.join(' ');
    } else {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }

  /**
   * ip -> int 변환
   */
  static ip2long(ip: string): number {
    let arr = ip.split('.');
    return ((+arr[0] * 256 + +arr[1]) * 256 + +arr[2]) * 256 + +arr[3];
  }

  /**
   * int -> ip 변환
   */
  static long2ip(num: number): string {
    let ip = (num % 256).toString();
    for (let i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      ip = (num % 256) + '.' + ip;
    }
    return ip;
  }
}
