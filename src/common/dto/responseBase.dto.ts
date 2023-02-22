import {ApiProperty} from '@nestjs/swagger';

/**
 * response base dto
 */
export class ResponseBaseDto {
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
