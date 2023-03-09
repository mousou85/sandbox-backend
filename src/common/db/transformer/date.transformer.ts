import dayjs from 'dayjs';
import {ValueTransformer} from 'typeorm';

/**
 * 날짜 변환 (typeORM 전용)
 */
export class DateTransformer implements ValueTransformer {
  constructor(private format: string = 'YYYY-MM-DD HH:mm:ss') {}
  /** DB to entity */
  from(dbValue: Date | null): string | null {
    if (typeof dbValue == 'string') {
      dbValue = new Date(dbValue);
    }
    return dbValue === null || isNaN(Number(dbValue)) ? null : dayjs(dbValue).format(this.format);
  }
  /** entity to DB */
  to(entityValue: Date | string | null): string | null {
    if (entityValue instanceof Date) {
      return dayjs(entityValue).format(this.format);
    } else {
      return entityValue || null;
    }
  }
}
