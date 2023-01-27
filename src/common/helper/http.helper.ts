import {CLS_REQ, ClsServiceManager} from 'nestjs-cls';
import {CustomClsStore} from '@common/middleware/cls.middleware';
import {Request} from 'express';

export class HttpHelper {
  private static cls = ClsServiceManager.getClsService<CustomClsStore>();

  /**
   * request id 반환
   */
  static getRequestId(): string {
    return this.cls.getId();
  }

  /**
   * http method 반환
   */
  static getMethod(): string {
    const req: Request = this.cls.get(CLS_REQ);
    return req.method;
  }

  /**
   * header 전체 반환
   */
  static getHeaders(): Record<string, string | string[]> {
    const req: Request = this.cls.get(CLS_REQ);
    return req.headers;
  }

  /**
   * header 반환
   * @param key header 키
   */
  static getHeader(key: string): string | string[] {
    const req: Request = this.cls.get(CLS_REQ);
    return req.headers[key];
  }

  /**
   * original url 반환
   */
  static getOriginalUrl(): string {
    const req: Request = this.cls.get(CLS_REQ);
    return req.originalUrl;
  }

  /**
   * ip 반환
   */
  static getRemoteIp(): string {
    return this.cls.get('CLS_REMOTE_IP');
  }

  /**
   * user agent 반환
   */
  static getUserAgent(): string {
    return this.cls.get('CLS_USER_AGENT');
  }
}
