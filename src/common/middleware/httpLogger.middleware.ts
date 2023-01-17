import {Injectable, LoggerService, NestMiddleware} from '@nestjs/common';
import {Request, Response} from 'express';
import {createLogger} from '@common/logger/app.logger';

/**
 * HTTP 접속 로거 미들웨어
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger: LoggerService;

  constructor() {
    this.logger = createLogger('HTTP');
  }

  use(req: Request, res: Response, next: (error?: any) => void): any {
    const {ip, method, originalUrl} = req;
    const userAgent = req.get('user-agent');

    res.on('finish', () => {
      const {statusCode} = res;
      this.logger.log(`${method} ${originalUrl} ${statusCode} ${ip} ${userAgent}`);
    });

    next();
  }
}
