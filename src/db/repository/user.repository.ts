import {Injectable} from '@nestjs/common';
import {Repository, SelectQueryBuilder} from 'typeorm';
import {UserEntity, UserPasswordSaltEntity} from '@db/entity';
import {InjectRepository} from '@nestjs/typeorm';
import {BaseRepository} from '@db/repository/base.repository';
import {EYNState} from '@db/db.enum';
import {IFindAllResult, IQueryListOption} from '@db/db.interface';

export interface IUserCondition {
  user_idx?: number;
  id?: string;
  name?: string;
  created_at?: {begin: string; end: string};
  use_otp?: EYNState;
}

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected repository: Repository<UserEntity>,
    @InjectRepository(UserPasswordSaltEntity)
    protected userPasswordSaltRepository: Repository<UserPasswordSaltEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder() {
    return this.repository.createQueryBuilder('user');
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    condition: IUserCondition
  ) {
    if (condition.user_idx) {
      queryBuilder.andWhere('user.user_idx = :user_idx', {user_idx: condition.user_idx});
    }
    if (condition.id) {
      queryBuilder.andWhere('user.id = :id', {id: condition.id.trim()});
    }
    if (condition.name) {
      queryBuilder.andWhere('user.name = :name', {name: condition.name.trim()});
    }
    if (condition.created_at) {
      const {begin, end} = condition.created_at;
      if (begin) {
        queryBuilder.andWhere('user.created_at >= :beginCreatedAt', {beginCreatedAt: begin});
      }
      if (end) {
        queryBuilder.andWhere('user.created_at <= :endCreatedAt', {endCreatedAt: end});
      }
    }
    if (condition.use_otp) {
      queryBuilder.andWhere('user.use_otp = :use_otp', {use_otp: condition.use_otp});
    }

    return queryBuilder;
  }

  async findByCondition(condition: IUserCondition): Promise<UserEntity | null> {
    return super.findByCondition(condition);
  }

  async findAllByCondition(
    condition: IUserCondition,
    listOption?: IQueryListOption
  ): Promise<IFindAllResult<UserEntity>> {
    return super.findAllByCondition(condition, listOption);
  }

  /**
   * password salt 반환
   * @param userIdx
   */
  async getPasswordSalt(userIdx: number): Promise<string | null> {
    const result = await this.userPasswordSaltRepository.findOneBy({user_idx: userIdx});
    return result ? result.salt : null;
  }

  /**
   * login fail count 증가
   * @param userIdx
   */
  async increaseLoginFailCount(userIdx: number): Promise<void> {
    const entity = await this.findOneBy({user_idx: userIdx});
    if (!entity) return;

    entity.login_fail_count += 1;
    await this.save(entity, {reload: false});
  }
}
