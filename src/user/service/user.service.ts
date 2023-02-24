import {Injectable} from '@nestjs/common';
import {IUserJoinOption, UserLoginLogRepository, UserRepository} from '@db/repository';
import * as crypto from 'crypto';
import {EUserLoginLogType, UserEntity} from '@db/entity';
import {DataNotFoundException} from '@common/exception';
import {DataSource} from 'typeorm';
import {EditUserInfoDto} from '@app/user/dto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class UserService {
  constructor(
    protected dataSource: DataSource,
    protected userRepository: UserRepository,
    protected loginLogRepository: UserLoginLogRepository
  ) {}

  /**
   * 유저 데이터 반환
   * @param userIdx
   * @param joinOption
   */
  async getUser(userIdx: number, joinOption?: IUserJoinOption): Promise<UserEntity> {
    return this.userRepository.findByCondition({user_idx: userIdx}, joinOption);
  }

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
    if (!userEntity) throw new DataNotFoundException('user');

    return this.verifyPassword(password, userEntity.userPasswordSalt.salt, userEntity.password);
  }

  /**
   * 패스워드 변경
   * @param userIdx
   * @param newPassword
   */
  async changePassword(userIdx: number, newPassword: string): Promise<void> {
    //set vars: 유저 데이터
    const userEntity = await this.userRepository.findByCondition({user_idx: userIdx});
    if (!userEntity) {
      throw new DataNotFoundException('user');
    }

    //set vars: 새 비밀번호 암호화
    const {hashedPassword, salt} = this.encryptPassword(newPassword);

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //password salt 업데이트
      await this.userRepository.setPasswordSalt(userIdx, salt, entityManager);

      //패스워드 업데이트
      userEntity.password = hashedPassword;
      await entityManager.save(userEntity, {reload: false});

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * OTP 등록 여부
   * @param userIdx
   */
  async hasOtpSecret(userIdx: number): Promise<boolean> {
    return !!(await this.userRepository.getOtpSecret(userIdx));
  }

  /**
   * OTP secret 생성
   * @param userEntity
   */
  async createOtpSecret(
    userEntity: UserEntity
  ): Promise<{secret: string; authUrl: string; qrCodeImage: string}> {
    const otpSecret = speakeasy.generateSecret({
      length: 32,
      name: 'sand box',
    });

    const authUrl = speakeasy.otpauthURL({
      secret: otpSecret.base32,
      issuer: 'sand box',
      label: userEntity.id,
      period: 30,
      digits: 6,
      encoding: 'base32',
    });

    const qrCodeImage = await qrcode.toDataURL(authUrl);

    return {
      secret: otpSecret.base32,
      authUrl: authUrl,
      qrCodeImage: qrCodeImage,
    };
  }

  /**
   * OTP secret 저장/수정
   * @param userIdx
   * @param otpSecret
   */
  async upsertOtpSecret(userIdx: number, otpSecret: string): Promise<void> {
    //set vars: 유저 데이터
    const userEntity = await this.userRepository.findByCondition({user_idx: userIdx});
    if (!userEntity) {
      throw new DataNotFoundException('user');
    }

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //otp secret 저장/수정
      await this.userRepository.setOtpSecret(userIdx, otpSecret, entityManager);

      //OTP 사용 여부 갱신
      userEntity.use_otp = 'y';
      await entityManager.save(userEntity, {reload: false});

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * OTP secret 삭제
   * @param userIdx
   */
  async deleteOtpSecret(userIdx: number): Promise<void> {
    //set vars: 유저 데이터
    const userEntity = await this.userRepository.findByCondition({user_idx: userIdx});
    if (!userEntity) {
      throw new DataNotFoundException('user');
    }

    //set vars: OTP secret 데이터
    const otpEntity = await this.userRepository.getOtpSecret(userIdx);
    if (!otpEntity) {
      throw new DataNotFoundException('user');
    }

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityManager = queryRunner.manager;

      //otp 데이터 삭제
      await entityManager.remove(otpEntity);

      //OTP 사용 여부 갱신
      userEntity.use_otp = 'n';
      await entityManager.save(userEntity, {reload: false});

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
      throw new DataNotFoundException('user');
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
