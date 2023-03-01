import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {QueryRunner, Repository, SelectQueryBuilder} from 'typeorm';

import {HttpHelper} from '@common/helper';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';
import {EUserLoginLogType, UserLoginLogEntity} from '@db/entity';
import {BaseRepository} from '@db/repository';

export interface IUserLoginLogCondition {
  user_idx?: number;
  log_type?: EUserLoginLogType | EUserLoginLogType[];
  created_at?: {begin: string; end: string};
}

@Injectable()
export class UserLoginLogRepository extends BaseRepository<UserLoginLogEntity> {
  constructor(
    @InjectRepository(UserLoginLogEntity)
    protected repository: Repository<UserLoginLogEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder() {
    return this.repository.createQueryBuilder('login_log');
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<UserLoginLogEntity>,
    condition: IUserLoginLogCondition
  ) {
    const {user_idx, log_type, created_at} = condition;

    if (user_idx) {
      queryBuilder.andWhere('login_log.user_idx = :user_idx', {user_idx});
    }
    if (log_type || (Array.isArray(log_type) && log_type.length)) {
      Array.isArray(log_type)
        ? queryBuilder.andWhere('login_log.log_type IN (:...log_type)', {log_type})
        : queryBuilder.andWhere('login_log.log_type = :log_type', {log_type});
    }
    if (created_at) {
      const {begin, end} = created_at;
      if (begin) {
        queryBuilder.andWhere('login_log.created_at >= :beginCreatedAt', {beginCreatedAt: begin});
      }
      if (end) {
        queryBuilder.andWhere('login_log.created_at <= :endCreatedAt', {endCreatedAt: end});
      }
    }

    return queryBuilder;
  }

  async existsBy(condition: IUserLoginLogCondition): Promise<boolean> {
    return super.existsBy(condition);
  }

  async countByCondition(condition: IUserLoginLogCondition): Promise<number> {
    return super.countByCondition(condition);
  }

  async findByCondition(condition: IUserLoginLogCondition): Promise<UserLoginLogEntity | null> {
    return super.findByCondition(condition);
  }

  async findAllByCondition(
    condition: IUserLoginLogCondition,
    listOption?: IQueryListOption
  ): Promise<IFindAllResult<UserLoginLogEntity>> {
    return super.findAllByCondition(condition, listOption);
  }

  /**
   * 로그인 로그 insert
   * @param userIdx user idx
   * @param logType 로그 타입
   * @param ip ip address
   * @param userAgent user agent
   * @param createdAt log date
   * @param queryRunner query runner(트랜잭션 사용하는 경우)
   */
  async insertLog(
    userIdx: number,
    logType: EUserLoginLogType,
    ip?: string,
    userAgent?: string,
    createdAt?: string,
    queryRunner?: QueryRunner
  ) {
    const entity = this.create();
    entity.user_idx = userIdx;
    entity.log_type = logType;
    entity.ip = ip ?? HttpHelper.getRemoteIp();
    entity.user_agent = userAgent ?? HttpHelper.getUserAgent();
    if (createdAt) entity.created_at = createdAt;

    queryRunner
      ? await queryRunner.manager.save(entity, {reload: false})
      : await this.save(entity, {reload: false});
  }
}
