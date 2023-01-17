import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import {Request, Response} from 'express';
import {TypeORMError} from 'typeorm';
import * as process from 'process';
import {ErrorResponseDto} from '@common/dto';

/**
 * 글로벌 exception 필터
 * - 모든 exception/error는 이 필터를 거쳐서 response됨
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost): any {
    //set vars: context, response, request
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    //error 종류에 따라 출력값 설정
    let statusCode;
    let message, error;

    if (process.env.NODE_ENV != 'production') {
      console.log(exception);
    }

    if (exception instanceof TypeORMError) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = exception.name;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      statusCode = exception.getStatus() ?? HttpStatus.BAD_REQUEST;
      if (typeof exceptionResponse == 'string') {
        error = 'Bad Request';
        message = exceptionResponse;
      } else {
        error = exceptionResponse['error'] ?? exception['message'];
        message = Array.isArray(exceptionResponse['message'])
          ? exceptionResponse['message'].shift()
          : exceptionResponse['message'] || 'Unknown Error';
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      error = (exception as Error).name;
      message = (exception as Error).message;
    }

    //로그 출력
    this.logger.error(exception);

    const errorResponseDto = new ErrorResponseDto(statusCode, error, message);

    //응답값 출력
    response.status(statusCode).json(errorResponseDto);
  }
}
