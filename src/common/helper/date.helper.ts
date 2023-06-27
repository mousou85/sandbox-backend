import dayjs, {OpUnitType, QUnitType} from 'dayjs';

export type TDateType = string | number | Date | dayjs.Dayjs;

export class DateHelper {
  /**
   * 현재 날짜/시간 반환
   * @param [format=YYYY-MM-DD　HH:mm:ss] 포맷
   */
  static now(format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return this.format(null, format);
  }

  /**
   * 날짜 포맷 변환
   * @param [date=now] 날짜(default: 현재시간)
   * @param [format=YYYY-MM-DD　HH:mm:ss] 날짜 포맷
   */
  static format(date?: TDateType, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date ?? undefined).format(format);
  }

  /**
   * 해당 월의 마지막 일 반환
   * @param date
   */
  static endOfMonth(date?: TDateType): string {
    return this.endOf(date, 'month', 'YYYY-MM-DD');
  }

  /**
   * 해당 년도 마지막 일 반환
   * @param date
   */
  static endOfYear(date?: TDateType): string {
    return this.endOf(date, 'year', 'YYYY-MM-DD');
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
    date?: TDateType,
    unit: OpUnitType = 'month',
    format: string = 'YYYY-MM-DD'
  ): string {
    if (!unit) unit = 'month';
    if (!format) format = 'YYYY-MM-DD';

    return dayjs(date ?? undefined)
      .endOf(unit)
      .format(format);
  }

  /**
   * 두 날짜를 비교
   * - criteriaDate가 targetDate보다 이전/이후인지 비교
   * (= criteriaDate - targetDate)
   * @param criteriaDate 기준 일자
   * @param targetDate 대상 일자
   * @param [unit=milliseconds] 단위
   * @return criteriaDate가 targetDate보다 이전이면 음수반환, 이후이면 양수반환
   */
  static diff(
    criteriaDate: TDateType,
    targetDate: TDateType,
    unit: QUnitType = 'milliseconds'
  ): number {
    criteriaDate = dayjs(criteriaDate);
    targetDate = dayjs(targetDate);

    return criteriaDate.diff(targetDate, unit);
  }
}
