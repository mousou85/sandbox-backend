import {HttpException, HttpStatus} from '@nestjs/common';

export class DataNotFoundException extends HttpException {
  constructor(message?) {
    message = message || 'Data Not Found';
    const response = HttpException.createBody(message, 'Data Not Found', HttpStatus.BAD_REQUEST);
    super(response, HttpStatus.BAD_REQUEST);
  }
}
