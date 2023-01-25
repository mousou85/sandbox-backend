import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {UserLoginLogRepository, UserRepository} from '@db/repository';
import {MissingParameterException, UserNotFoundException} from '@common/exception';
import {UserService} from '@app/user/service/user.service';

@Injectable()
export class AuthService {
  constructor(
    protected userRepository: UserRepository,
    protected userLoginLogRepository: UserLoginLogRepository,
    protected userService: UserService
  ) {}

  async validateUser(id: string, password: string) {
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
  }
}
