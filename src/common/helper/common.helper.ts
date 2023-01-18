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
}
