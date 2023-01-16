import {Injectable} from '@nestjs/common';
import {Repository, SelectQueryBuilder} from 'typeorm';
import {UserEntity} from '@db/entity';
import {InjectRepository} from '@nestjs/typeorm';
import {BaseRepository} from '@db/repository/base.repository';
import {EYNState} from '@db/db.enum';

export interface IUserCondition {
  id: string;
  name: string;
  created_at: {begin: string; end: string};
  use_otp: EYNState;
}

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(@InjectRepository(UserEntity) protected repository: Repository<UserEntity>) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getCustomQueryBuilder() {
    return this.repository.createQueryBuilder('user');
  }

  setQueryBuilderCondition(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    condition: IUserCondition
  ) {
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
}
