import {HttpException, HttpStatus} from '@nestjs/common';

export class MissingParameterException extends HttpException {
  constructor(message?, missingParameters?: string[]) {
    message = message || 'Missing parameter';
    if (Array.isArray(missingParameters) && missingParameters.length) {
      message += `: ${missingParameters}`;
    }
    const response = HttpException.createBody(message, 'Missing parameter', HttpStatus.BAD_REQUEST);
    super(response, HttpStatus.BAD_REQUEST);
  }
}
