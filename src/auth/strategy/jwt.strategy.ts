import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthService} from '@app/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request) {
    const token = req.headers.authorization?.slice(7);
    if (!token) {
      throw new UnauthorizedException('Access Token Missing');
    }

    const payload = this.authService.verifyAccessToken(token);
    if (!payload || !payload.uid) {
      throw new UnauthorizedException('Invalid Access Token');
    }

    return this.authService.validateUserByUid(payload.uid);
  }
}
