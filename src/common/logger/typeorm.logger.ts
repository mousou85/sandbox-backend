import {LoggerService} from '@nestjs/common';
import {QueryRunner} from 'typeorm';
import {Logger as TypeORMLoggerInterface} from 'typeorm/logger/Logger';

import {DateHelper} from '@common/helper';
import {createLogger} from '@common/logger';

export class TypeORMLogger implements TypeORMLoggerInterface {
  private logger: LoggerService;

  constructor(appName: string = 'DB') {
    this.logger = createLogger(appName, {consoleLogLevel: 'debug'});
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    return;
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.debug(this.rawQuery(query, parameters));
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ) {
    this.logger.error(this.rawQuery(query, parameters), error);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.warn(`Time: ${time} | Query: ${this.rawQuery(query, parameters)}`);
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    return;
  }

  private rawQuery(query: string, parameters?: any[]): string {
    if (!parameters) {
      return query;
    }
    const copyParams = Array.from(parameters);

    return query.replace(/\?/g, () => {
      const param = copyParams.shift();

      if (typeof param == 'number') {
        return param;
      } else if (typeof param == 'string') {
        return `'${param}'`;
      } else if (param instanceof Date) {
        return `'${DateHelper.format(param)}'`;
      } else if (param === null) {
        return 'null';
      } else {
        return param ?? '?';
      }
    });
  }
}
