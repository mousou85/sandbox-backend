import {ApiProperty} from '@nestjs/swagger';

import {ResponseBaseDto} from '@common/dto';

/**
 * error response dto
 */
export class ErrorResponseDto extends ResponseBaseDto {
  @ApiProperty({description: 'error status code', required: true, type: 'number'})
  statusCode: number;
  @ApiProperty({description: 'error code', required: true, type: 'string'})
  error: string;
  @ApiProperty({description: 'error message', required: true, type: 'string'})
  message: string;

  constructor(statusCode: number, error: string, message: string) {
    super(false);
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
  }
}
