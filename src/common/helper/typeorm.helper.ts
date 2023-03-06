import {BaseEntity, SelectQueryBuilder} from 'typeorm';

import {IQueryDateCondition, IQueryDateRangeCondition} from '@db/db.interface';

/**
 * 헬퍼 옵션
 * @interface
 * @property [paramName] bind parameter 이름
 * @property [operator] where 조건 연결 연산자
 */
interface IHelperOpts {
  paramName?: string;
  operator?: 'and' | 'or';
}

export class TypeOrmHelper {
  /**
   * 날짜 조건 추가
   * @param queryBuilder
   * @param column
   * @param condition
   * @param opts
   */
  static addDateCondition<Entity extends BaseEntity>(
    queryBuilder: SelectQueryBuilder<Entity>,
    column: string,
    condition: IQueryDateCondition | IQueryDateRangeCondition,
    opts: IHelperOpts = {operator: 'and'}
  ) {
    const operator = opts?.operator ?? 'and';
    const paramName = opts?.paramName ?? column.replace(/\./g, '_');

    if ('op' in condition) {
      const query = `${column} ${condition.op} :${paramName}`;
      const param = {[paramName]: condition.value};

      operator == 'and' ? queryBuilder.andWhere(query, param) : queryBuilder.orWhere(query, param);
    } else {
      this.addBetweenClause(queryBuilder, column, condition.begin, condition.end, {
        paramName: paramName,
        operator: operator,
      });
    }
  }
  /**
   * in 조건 추가
   * @param queryBuilder select query builder
   * @param column 대상 컬럼
   * @param value 조건 값
   * @param opts 옵션
   */
  static addInClause<Entity extends BaseEntity>(
    queryBuilder: SelectQueryBuilder<Entity>,
    column: string,
    value: string[] | number[],
    opts: IHelperOpts = {operator: 'and'}
  ) {
    const operator = opts?.operator ?? 'and';
    const paramName = opts?.paramName ?? column.replace(/\./g, '_');

    const query = `${column} IN (:...${paramName})`;
    const param = {[paramName]: value};

    operator == 'and' ? queryBuilder.andWhere(query, param) : queryBuilder.orWhere(query, param);
  }

  /**
   * like 조건 추가
   * @param queryBuilder select query builder
   * @param column 대상 컬럼
   * @param value 조건 값
   * @param opts 옵션
   */
  static addLikeClause<Entity extends BaseEntity>(
    queryBuilder: SelectQueryBuilder<Entity>,
    column: string,
    value: string,
    opts: IHelperOpts = {operator: 'and'}
  ) {
    const operator = opts?.operator ?? 'and';
    const paramName = opts?.paramName ?? column.replace(/\./g, '_');

    const query = `${column} LIKE :${paramName}`;
    const param = {[paramName]: `%${value}%`};

    operator == 'and' ? queryBuilder.andWhere(query, param) : queryBuilder.orWhere(query, param);
  }

  /**
   * between 조건 추가
   * @param queryBuilder
   * @param column
   * @param beginDate
   * @param endDate
   * @param opts
   */
  static addBetweenClause<Entity extends BaseEntity>(
    queryBuilder: SelectQueryBuilder<Entity>,
    column: string,
    beginDate: string,
    endDate: string,
    opts: IHelperOpts = {operator: 'and'}
  ) {
    const operator = opts?.operator ?? 'and';
    const paramName = opts?.paramName ?? column.replace(/\./g, '_');

    const query = `${column} BETWEEN :${paramName}BeginDate AND :${paramName}EndDate`;
    let param = {};
    param[`${paramName}BeginDate`] = beginDate;
    param[`${paramName}EndDate`] = endDate;

    operator == 'and' ? queryBuilder.andWhere(query, param) : queryBuilder.orWhere(query, param);
  }
}
