import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {QueryRunner, Repository, SelectQueryBuilder} from 'typeorm';

import {UserEntity, UserOtpEntity, UserPasswordSaltEntity} from '@app/user/entity';
import {BaseRepository, EYNState, IFindAllResult, IQueryListOption} from '@common/db';

export interface IUserCondition {
  user_idx?: number;
  uid?: string;
  id?: string;
  name?: string;
  created_at?: {begin: string; end: string};
  use_otp?: EYNState;
}

export interface IUserJoinOption {
  passwordSalt?: boolean;
  otp?: boolean;
}

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected repository: Repository<UserEntity>,
    @InjectRepository(UserPasswordSaltEntity)
    protected userPasswordSaltRepository: Repository<UserPasswordSaltEntity>,
    @InjectRepository(UserOtpEntity)
    protected userOtpRepository: Repository<UserOtpEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder(joinOption?: IUserJoinOption, queryRunner?: QueryRunner) {
    const builder = this.repository.createQueryBuilder('user', queryRunner);
    if (joinOption?.passwordSalt) {
      builder.innerJoinAndSelect('user.userPasswordSalt', 'passwordSalt');
    }
    if (joinOption?.otp) {
      builder.leftJoinAndSelect('user.userOtp', 'otp');
    }

    return builder;
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    condition: IUserCondition
  ) {
    if (condition.user_idx) {
      queryBuilder.andWhere('user.user_idx = :user_idx', {user_idx: condition.user_idx});
    }
    if (condition.uid) {
      queryBuilder.andWhere('user.uid = :uid', {uid: condition.uid});
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

  async existsBy(condition: IUserCondition, queryRunner?: QueryRunner): Promise<boolean> {
    return super.existsBy(condition, queryRunner);
  }

  async countByCondition(condition: IUserCondition, queryRunner?: QueryRunner): Promise<number> {
    return super.countByCondition(condition, queryRunner);
  }

  async findByCondition(
    condition: IUserCondition,
    joinOption?: IUserJoinOption,
    queryRunner?: QueryRunner
  ): Promise<UserEntity | null> {
    return super.findByCondition(condition, joinOption, queryRunner);
  }

  async findAllByCondition(
    condition: IUserCondition,
    listOption?: IQueryListOption,
    joinOption?: IUserJoinOption,
    queryRunner?: QueryRunner
  ): Promise<IFindAllResult<UserEntity>> {
    return super.findAllByCondition(condition, listOption, joinOption, queryRunner);
  }

  /**
   * password salt 반환
   * @param userIdx
   */
  async getPasswordSalt(userIdx: number): Promise<UserPasswordSaltEntity | null> {
    const result = await this.userPasswordSaltRepository.findOneBy({user_idx: userIdx});
    return result ? result : null;
  }

  /**
   * password salt 저장/수정
   * @param userIdx 유저IDX
   * @param salt password salt
   * @param queryRunner 트랜잭션 사용하는 경우
   */
  async setPasswordSalt(userIdx: number, salt: string, queryRunner?: QueryRunner): Promise<void> {
    let entity = await this.userPasswordSaltRepository.findOneBy({user_idx: userIdx});
    if (!entity) {
      entity = this.userPasswordSaltRepository.create();
      entity.user_idx = userIdx;
    }
    entity.salt = salt;

    if (queryRunner) {
      await queryRunner.manager.save(entity, {reload: false});
    } else {
      await this.userPasswordSaltRepository.save(entity, {reload: false});
    }
  }

  /**
   * otp secret 반환
   * @param userIdx
   */
  async getOtpSecret(userIdx: number): Promise<UserOtpEntity | null> {
    const result = await this.userOtpRepository.findOneBy({user_idx: userIdx});
    return result ? result : null;
  }

  /**
   * otp secret 저장/수정
   * @param userIdx
   * @param otpSecret
   * @param queryRunner
   */
  async setOtpSecret(userIdx: number, otpSecret: string, queryRunner?: QueryRunner): Promise<void> {
    let entity = await this.userOtpRepository.findOneBy({user_idx: userIdx});
    if (!entity) {
      entity = this.userOtpRepository.create();
      entity.user_idx = userIdx;
    }
    entity.secret = otpSecret;

    if (queryRunner) {
      await queryRunner.manager.save(entity, {reload: false});
    } else {
      await this.userOtpRepository.save(entity, {reload: false});
    }
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
