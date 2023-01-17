import {ApiProperty} from '@nestjs/swagger';

class ResponseBaseDto {
  @ApiProperty({
    description: 'API 성공여부',
    required: true,
    type: 'boolean',
    examples: [true, false],
  })
  isSuccessful: boolean;

  constructor(isSuccessful: boolean) {
    this.isSuccessful = isSuccessful;
  }
}

/**
 * success response dto
 */
export class OkResponseDto<T> extends ResponseBaseDto {
  data?: T | T[];

  constructor(data?: T | T[]) {
    super(true);
    if (data) this.data = data;
  }
}

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
