import {EComparisonOp} from '@db/db.enum';

/**
 * SQL 쿼리 날짜 범위 조건
 */
export interface IQueryDateRangeCondition {
  begin: string;
  end: string;
}

/**
 * SQL 쿼리 날짜 조건
 */
export interface IQueryDateCondition {
  value: string;
  op: EComparisonOp;
}

/**
 * 정렬 옵션
 * - 커스텀된 select query builder에서 사용
 */
export interface IQuerySortOption {
  column: string;
  direction: 'ASC' | 'DESC';
}

/**
 * 리스트 옵션
 * - 커스텀된 select query builder에서 사용
 */
export interface IQueryListOption {
  getAll?: boolean;
  page?: number;
  pageSize?: number;
  sort?: IQuerySortOption | IQuerySortOption[];
}

/**
 * findAllByCondition() 리턴 타입
 * - 커스텀된 select query builder에서 사용
 */
export interface IFindAllResult<Entity> {
  totalCount: number;
  totalPage: number;
  list: Entity[];
}
