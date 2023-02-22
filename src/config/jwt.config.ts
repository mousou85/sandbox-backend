import {registerAs} from '@nestjs/config';
import * as process from 'process';
import {Algorithm} from 'jsonwebtoken';

interface IJwtConfig {
  accessTokenSecret: string;
  accessTokenAlgorithm: Algorithm;
  accessTokenExpire: string;
  refreshTokenSecret: string;
  refreshTokenAlgorithm: Algorithm;
  refreshTokenExpire: string;
  issuer: string;
}

export const jwtConfig = registerAs('jwt', (): IJwtConfig => {
  let accessTokenExpire, refreshTokenExpire;
  if (process.env.NODE_ENV == 'development') {
    accessTokenExpire = '7d';
    refreshTokenExpire = '30d';
  } else {
    accessTokenExpire = '10m';
    refreshTokenExpire = '1d';
  }

  return {
    accessTokenSecret: process.env.LOGIN_ACCESS_TOKEN_SECRET,
    accessTokenAlgorithm: 'HS256',
    accessTokenExpire,
    refreshTokenSecret: process.env.LOGIN_REFRESH_TOKEN_SECRET,
    refreshTokenAlgorithm: 'HS256',
    refreshTokenExpire,
    issuer: 'sandbox api',
  };
});
