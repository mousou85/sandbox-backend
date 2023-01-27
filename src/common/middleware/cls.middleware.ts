import {ClsService, ClsStore} from 'nestjs-cls';
import {Request} from 'express';
import {getClientIp} from '@supercharge/request-ip';
import {v4 as uuidV4} from 'uuid';

/**
 * cls 미들웨어
 */
export const clsMiddlewareSetup = (cls: ClsService<CustomClsStore>, req: Request) => {
  const userIp = getClientIp(req);
  const userAgent = req.get('user-agent');

  cls.set('CLS_REMOTE_IP', userIp);
  cls.set('CLS_USER_AGENT', userAgent);
};

/**
 * cls id 생성기
 * @param req
 */
export const clsIdGenerator = (req: Request) => {
  return req.headers['X-Request-Id'] ?? uuidV4();
};

/**
 * cls custom store 구조
 */
export interface CustomClsStore extends ClsStore {
  CLS_REMOTE_IP: string;
  CLS_USER_AGENT: string;
}
