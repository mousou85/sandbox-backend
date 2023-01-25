import dayjs from 'dayjs';

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
}
