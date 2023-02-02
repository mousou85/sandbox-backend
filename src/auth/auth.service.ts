import {BadRequestException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {UserLoginLogRepository, UserRepository} from '@db/repository';
import {MissingParameterException, UserNotFoundException} from '@common/exception';
import {UserService} from '@app/user/service/user.service';
import {UserEntity} from '@db/entity';
import {JwtService} from '@nestjs/jwt';
import {jwtConfig as jwtConfigBase} from '@config';
import {ConfigType} from '@nestjs/config';
import {TokenExpiredError} from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    protected userRepository: UserRepository,
    protected userLoginLogRepository: UserLoginLogRepository,
    protected userService: UserService,
    protected jwtService: JwtService,
    @Inject(jwtConfigBase.KEY) protected jwtConfig: ConfigType<typeof jwtConfigBase>
  ) {}

  /**
   * id/password 기반 유저 확인
   * @param id
   * @param password
   */
  async validateUser(id: string, password: string): Promise<UserEntity> {
    if (!id || !password) {
      throw new MissingParameterException();
    }

    //set vars: user entity
    const userEntity = await this.userRepository.findOneBy({id});
    if (!userEntity) {
      throw new UserNotFoundException();
    }

    if (userEntity.login_fail_count >= 5) {
      throw new BadRequestException('로그인 실패 횟수 초과');
    }

    //비밀번호 확인
    const passwordSalt = await this.userRepository.getPasswordSalt(userEntity.user_idx);
    if (!this.userService.verifyPassword(password, passwordSalt, userEntity.password)) {
      await this.userRepository.increaseLoginFailCount(userEntity.user_idx);

      await this.userLoginLogRepository.insertLog(
        userEntity.user_idx,
        userEntity.login_fail_count >= 4 ? 'loginFailExceed' : 'passwordMismatch'
      );
      throw new UnauthorizedException();
    }

    return userEntity;
  }

  /**
   * uid 기반 유저 확인
   * @param uid
   */
  async validateUserByUid(uid: string): Promise<UserEntity> {
    //set vars: user entity
    const userEntity = await this.userRepository.findOneBy({uid});
    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity;
  }

  /**
   * access token 생성
   * @param userEntity
   */
  createAccessToken(userEntity: UserEntity): string {
    return this.jwtService.sign({uid: userEntity.uid});
  }

  /**
   * access token 검증
   * @param accessToken
   */
  verifyAccessToken(accessToken: string) {
    try {
      return this.jwtService.verify(accessToken, {
        algorithms: [this.jwtConfig.accessTokenAlgorithm],
        issuer: this.jwtConfig.issuer,
        ignoreExpiration: false,
      });
    } catch (err) {
      throw new UnauthorizedException(
        err instanceof TokenExpiredError ? 'Token Expired' : err.message
      );
    }
  }

  /**
   * refresh token 생성
   * @param userEntity
   */
  createRefreshToken(userEntity: UserEntity): string {
    return this.jwtService.sign(
      {uid: userEntity.uid},
      {
        secret: this.jwtConfig.refreshTokenSecret,
        algorithm: this.jwtConfig.refreshTokenAlgorithm,
        expiresIn: this.jwtConfig.refreshTokenExpire,
        issuer: this.jwtConfig.issuer,
      }
    );
  }

  /**
   * refresh token 검증
   * @param refreshToken
   */
  verifyRefreshToken(refreshToken: string) {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.refreshTokenSecret,
        algorithms: [this.jwtConfig.refreshTokenAlgorithm],
        issuer: this.jwtConfig.issuer,
        ignoreExpiration: false,
      });
    } catch (err) {
      throw new UnauthorizedException(err instanceof TokenExpiredError ? 'Token Expired' : err);
    }
  }
}
