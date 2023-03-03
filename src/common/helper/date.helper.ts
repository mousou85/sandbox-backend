import dayjs, {OpUnitType} from 'dayjs';

export class DateHelper {
  /**
   * 날짜 포맷 변환
   * @param [date=now] 날짜(default: 현재시간)
   * @param [format=YYYY-MM-DD　HH:mm:ss] 날짜 포맷
   */
  static format(
    date?: string | number | Date | dayjs.Dayjs,
    format: string = 'YYYY-MM-DD HH:mm:ss'
  ): string {
    return dayjs(date ?? undefined).format(format);
  }

  /**
   * 해당 월의 마지막 일 반환
   * @param date
   */
  static endOfDay(date?: string | number | Date | dayjs.Dayjs): string {
    return this.endOf(date, 'month', 'YYYY-MM-DD');
  }

  /**
   * 단위에 해당하는 마지막 값 반환
   * - year: 년도의 마지막 날
   * - month: 월의 마지막 날 등등
   * @param date
   * @param unit
   * @param format
   */
  static endOf(
    date?: string | number | Date | dayjs.Dayjs,
    unit: OpUnitType = 'month',
    format: string = 'YYYY-MM-DD'
  ): string {
    if (!unit) unit = 'month';
    if (!format) format = 'YYYY-MM-DD';

    return dayjs(date ?? undefined)
      .endOf(unit)
      .format(format);
  }
}
