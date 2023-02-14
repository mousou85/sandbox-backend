import {Injectable} from '@nestjs/common';
import {UserLoginLogRepository, UserRepository} from '@db/repository';
import * as crypto from 'crypto';
import {EUserLoginLogType, UserEntity} from '@db/entity';
import {DataNotFoundException} from '@common/exception';
import {DataSource} from 'typeorm';
import {EditUserInfoDto} from '@app/user/dto';

@Injectable()
export class UserService {
  constructor(
    protected dataSource: DataSource,
    protected userRepository: UserRepository,
    protected loginLogRepository: UserLoginLogRepository
  ) {}

  /**
   * 비밀번호 해싱
   * @param password
   */
  encryptPassword(password: string): {hashedPassword: string; salt: string} {
    const salt = crypto.randomBytes(64).toString('base64');
    const hash = crypto.pbkdf2Sync(password, salt, 2280, 128, 'sha512');
    const hashedPassword = hash.toString('base64');

    return {
      hashedPassword,
      salt,
    };
  }

  /**
   * 비밀번호 비교
   * @param password 패스워드
   * @param salt salt
   * @param hashedUserPassword 해쉬된 비교대상 패스워드
   */
  verifyPassword(password: string, salt: string, hashedUserPassword: string): boolean {
    const hash = crypto.pbkdf2Sync(password, salt, 2280, 128, 'sha512');
    const hashedPassword = hash.toString('base64');
    return hashedPassword == hashedUserPassword;
  }

  /**
   * 유저IDX로 비밀번호 비교
   * @param password 패스워드
   * @param userIdx 유저IDX
   */
  async verifyPasswordByIdx(password: string, userIdx: number): Promise<boolean> {
    const userEntity = await this.userRepository.findByCondition(
      {user_idx: userIdx},
      {passwordSalt: true}
    );
    if (!userEntity) throw new DataNotFoundException('user data not found');

    return this.verifyPassword(password, userEntity.userPasswordSalt.salt, userEntity.password);
  }

  /**
   * 패스워드 변경
   * @param userIdx
   * @param newPassword
   */
  async changePassword(userIdx: number, newPassword: string): Promise<boolean> {
    //set vars: 유저 데이터
    const userEntity = await this.userRepository.findByCondition({user_idx: userIdx});
    if (!userEntity) {
      throw new DataNotFoundException('user data not found');
    }

    //set vars: 새 비밀번호 암호화
    const {hashedPassword, salt} = this.encryptPassword(newPassword);

    //트랜잭션 처리
    let retVal = false;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //password salt 업데이트
      await this.userRepository.setPasswordSalt(userIdx, salt, entityManager);

      //패스워드 업데이트
      userEntity.password = hashedPassword;
      await entityManager.save(userEntity);

      await queryRunner.commitTransaction();

      retVal = true;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      retVal = false;
    } finally {
      await queryRunner.release();
    }

    return retVal;
  }

  /**
   * 유저 데이터 수정
   * @param userIdx
   * @param editDto 수정할 데이터(속성중 password 관련은 changePassword()로 변경해야함)
   */
  async editInfo(userIdx: number, editDto: EditUserInfoDto): Promise<UserEntity> {
    //set vars: 유저 데이터
    const userEntity = await this.userRepository.findByCondition({user_idx: userIdx});
    if (!userEntity) {
      throw new DataNotFoundException('user data not found');
    }

    //업데이트
    const {name} = editDto;
    if (name) userEntity.name = name;

    await this.userRepository.save(userEntity);

    return userEntity;
  }

  /**
   * 로그인 로그 insert
   * @param userIdx
   * @param logType
   * @param ip
   * @param userAgent
   * @param createdAt
   */
  async insertLoginLog(
    userIdx: number,
    logType: EUserLoginLogType,
    ip?: string,
    userAgent?: string,
    createdAt?: string
  ): Promise<void> {
    return this.loginLogRepository.insertLog(userIdx, logType, ip, userAgent, createdAt);
  }
}
