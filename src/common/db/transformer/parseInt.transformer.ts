import {ValueTransformer} from 'typeorm';

/**
 * 값을 int로 변환 (typeORM 전용)
 * - 객체선언시 nullToZero 인자를 통해 null|NaN일 경우 0으로 반환 처리 가능
 */
export class ParseIntTransformer implements ValueTransformer {
  constructor(private nullToZero: boolean = true) {}
  /** DB to entity */
  from(dbValue: number | string | null): number | null {
    if (typeof dbValue === 'number') return dbValue;

    let parseResult = parseInt(dbValue);
    return isNaN(parseResult) ? (this.nullToZero ? 0 : null) : parseResult;
  }
  /** entity to DB */
  to(entityValue: number | string | null): number | null {
    if (typeof entityValue === 'number') return entityValue;

    let parseResult = parseInt(entityValue);
    return isNaN(parseResult) ? (this.nullToZero ? 0 : null) : parseResult;
  }
}
