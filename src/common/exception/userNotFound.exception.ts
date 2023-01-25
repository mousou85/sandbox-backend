import {HttpException, HttpStatus} from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(message?) {
    message = message || 'User Not Found';
    const response = HttpException.createBody(message, 'User Not Found', HttpStatus.UNAUTHORIZED);
    super(response, HttpStatus.UNAUTHORIZED);
  }
}
