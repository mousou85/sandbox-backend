import {HttpException, HttpStatus} from '@nestjs/common';

import {CommonHelper} from '@common/helper';

export class DataNotFoundException extends HttpException {
  constructor(dataName?) {
    const message = dataName
      ? `${CommonHelper.capitalizeFirstLetter(dataName)} data not found`
      : 'Data not found';
    const response = HttpException.createBody(message, 'Data Not Found', HttpStatus.BAD_REQUEST);
    super(response, HttpStatus.BAD_REQUEST);
  }
}
