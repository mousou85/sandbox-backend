import {Injectable, LoggerService, NestMiddleware} from '@nestjs/common';
import {Request, Response} from 'express';

import {HttpHelper} from '@common/helper';
import {createLogger} from '@common/logger';

/**
 * HTTP 접속 로거 미들웨어
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger: LoggerService;

  constructor() {
    this.logger = createLogger('HTTP', {consoleLogLevel: 'info'});
  }

  use(req: Request, res: Response, next: (error?: any) => void): any {
    const requestId = HttpHelper.getRequestId();
    const ip = HttpHelper.getRemoteIp();
    const method = HttpHelper.getMethod();
    const userAgent = HttpHelper.getUserAgent();
    const originalUrl = HttpHelper.getOriginalUrl();

    res.on('finish', () => {
      const {statusCode} = res;
      this.logger.log(`[${requestId}] ${method} ${originalUrl} ${statusCode} ${ip} ${userAgent}`);
    });

    next();
  }
}
