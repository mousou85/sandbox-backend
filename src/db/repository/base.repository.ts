import {BaseEntity, Repository, SelectQueryBuilder} from 'typeorm';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {CommonHelper} from '@common/helper';

export abstract class BaseRepository<Entity extends BaseEntity> extends Repository<Entity> {
  /**
   * 커스텀된 select query builder 반환
   * @param joinOption join 옵션
   */
  abstract getCustomQueryBuilder(joinOption?: Record<string, boolean>): SelectQueryBuilder<Entity>;

  /**
   * select query builder에 조건 설정
   * @param queryBuilder select query builder
   * @param condition 조건
   */
  abstract setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<Entity>,
    condition: Record<string, any>
  ): SelectQueryBuilder<Entity>;

  /**
   * 데이터 유무
   * - 커스텀된 select query builder 사용
   * @param condition 조건
   */
  async existsBy(condition: Record<string, any>): Promise<boolean> {
    let queryBuilder = this.getCustomQueryBuilder();
    queryBuilder = this.setQueryBuilderCondition(queryBuilder, condition);
    return !!(await queryBuilder.getCount());
  }

  /**
   * 조건에 해당하는 레코드 하나 반환
   * - 커스텀된 select query builder 사용
   * @param condition 조건
   * @param joinOption join 옵션
   */
  async findByCondition(
    condition: Record<string, any>,
    joinOption?: Record<string, boolean>
  ): Promise<Entity | null> {
    let queryBuilder = this.getCustomQueryBuilder(joinOption);
    queryBuilder = this.setQueryBuilderCondition(queryBuilder, condition);
    return queryBuilder.getOne();
  }

  /**
   * 조건에 해당하는 다수의 레코드 반환
   * - 커스텀된 select query builder 사용
   * @param condition 조건
   * @param listOption list 옵션
   * @param joinOption join 옵션
   */
  async findAllByCondition(
    condition: Record<string, any>,
    listOption?: IQueryListOption,
    joinOption?: Record<string, boolean>
  ): Promise<IFindAllResult<Entity>> {
    const page = listOption?.page || 1;
    const pageSize = listOption?.pageSize || 20;
    const sort = listOption?.sort ?? null;
    const getAll = listOption?.getAll ?? false;

    let queryBuilder = this.getCustomQueryBuilder(joinOption);
    queryBuilder = this.setQueryBuilderCondition(queryBuilder, condition);

    if (sort) {
      Array.isArray(sort)
        ? sort.forEach((item) => queryBuilder.addOrderBy(item.column, item.direction))
        : queryBuilder.orderBy(sort.column, sort.direction);
    }
    if (!getAll) {
      queryBuilder.offset(CommonHelper.getPageOffset(page, pageSize));
      queryBuilder.limit(pageSize);
    }

    const [list, totalCount] = await queryBuilder.getManyAndCount();
    const totalPage = getAll ? 1 : CommonHelper.getTotalPage(totalCount, pageSize);

    return {
      totalCount: totalCount,
      totalPage: totalPage,
      list: list,
    };
  }
}
