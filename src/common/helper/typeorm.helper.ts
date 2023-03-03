import {BaseEntity, SelectQueryBuilder} from 'typeorm';

export class TypeOrmHelper {
  /**
   * in 조건 추가
   * @param queryBuilder select query builder
   * @param column 대상 컬럼
   * @param value 조건 값
   * @param opts 옵션
   * @param [opts.paramName] bind parameter 이름
   * @param [opts.operator=and] where 조건 연결 연산자
   */
  static addInClause<Entity extends BaseEntity>(
    queryBuilder: SelectQueryBuilder<Entity>,
    column: string,
    value: string[] | number[],
    opts: {paramName?: string; operator?: 'and' | 'or'} = {operator: 'and'}
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
   * @param [opts.paramName] bind parameter 이름
   * @param [opts.operator=and] where 조건 연결 연산자
   */
  static addLikeClause<Entity extends BaseEntity>(
    queryBuilder: SelectQueryBuilder<Entity>,
    column: string,
    value: string,
    opts: {paramName?: string; operator?: 'and' | 'or'} = {operator: 'and'}
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
    opts: {paramName?: string; operator?: 'and' | 'or'} = {operator: 'and'}
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
