import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-local';
import {AuthService} from '@app/auth/auth.service';
import {UserEntity} from '@db/entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({usernameField: 'userId', passwordField: 'password'});
  }

  async validate(id: string, password: string): Promise<UserEntity> {
    return this.authService.validateUser(id, password);
  }
}
