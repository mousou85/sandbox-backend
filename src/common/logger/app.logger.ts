import * as process from 'process';

import {LoggerService} from '@nestjs/common';
import dayjs from 'dayjs';
import {utilities as nestWinstonModuleUtilities, WinstonModule} from 'nest-winston';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

/**
 * date format 변경
 */
const timestampFormat = winston.format((info) => {
  info.timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  return info;
});
/**
 * log level 변조
 */
const levelFormat = winston.format((info) => {
  info.level = info.level.toUpperCase();
  return info;
});
/**
 * log 파일용 포맷
 */
const logFileFormat = winston.format.printf((info) => {
  let jsonData = {
    timestamp: info.timestamp,
    level: info.level,
    message: info.message,
  };
  if (info.response) jsonData['response'] = info.response;
  if (info.stack) jsonData['stack'] = info.stack;
  return JSON.stringify(jsonData);
});

/**
 * nest.js용 winston 로거 생성
 */
export const createLogger = (
  appName: string,
  opts?: {
    consoleLogLevel: string | 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';
  }
): LoggerService => {
  //set vars: logger env
  const {LOGGER_FILE_ENABLE, LOGGER_FILE_PATH} = process.env;

  //set vars: options
  const {consoleLogLevel} = opts;

  //트랜스포터 정의
  const transports: winston.transport[] = [];

  transports.push(
    new winston.transports.Console({
      level: consoleLogLevel || 'error',
      format: winston.format.combine(
        timestampFormat(),
        levelFormat(),
        winston.format.colorize({all: true}),
        nestWinstonModuleUtilities.format.nestLike(appName, {prettyPrint: true, colors: true})
      ),
    })
  );

  if (LOGGER_FILE_ENABLE == 'true' && LOGGER_FILE_PATH) {
    //파일 로깅(info)
    transports.push(
      new winstonDaily({
        level: 'info',
        dirname: LOGGER_FILE_PATH,
        filename: `${appName}.info-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '10m',
        maxFiles: '30d',
        format: winston.format.combine(timestampFormat(), levelFormat(), logFileFormat),
      })
    );

    //파일 로깅(error)
    transports.push(
      new winstonDaily({
        level: 'error',
        dirname: LOGGER_FILE_PATH,
        filename: `${appName}.error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '10m',
        maxFiles: '30d',
        format: winston.format.combine(timestampFormat(), levelFormat(), logFileFormat),
      })
    );
  }

  //로거 인스턴스 반환
  return WinstonModule.createLogger({transports: transports});
};
