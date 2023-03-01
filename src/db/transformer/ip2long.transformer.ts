import {ValueTransformer} from 'typeorm';

import {CommonHelper} from '@common/helper';

/**
 * ip <-> long 변환 (typeORM 전용)
 */
export class Ip2LongTransformer implements ValueTransformer {
  /** DB to entity */
  from(dbValue: number | null): string | null {
    if (typeof dbValue == 'string') return dbValue;

    return dbValue ? CommonHelper.long2ip(dbValue) : dbValue.toString();
  }
  /** entity to DB */
  to(entityValue: string | null): number | null {
    if (typeof entityValue === 'number') return entityValue;

    return entityValue ? CommonHelper.ip2long(entityValue) : 0;
  }
}
