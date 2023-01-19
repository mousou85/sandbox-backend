import {Injectable} from '@nestjs/common';
import {UserRepository} from '@db/repository';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(protected userRepository: UserRepository) {}

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
}
