import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';

/**
 * 문자열 최대길이 제한 파이프
 */
@Injectable()
export class MaxLengthPipe implements PipeTransform {
  private readonly maxLength: number;
  constructor(maxLength: number) {
    this.maxLength = maxLength;
  }
  transform(value: string, metadata: ArgumentMetadata): any {
    if (value === undefined || value === null) {
      throw new BadRequestException(`${metadata.data} should not be empty`);
    }
    if (value.length > this.maxLength) {
      throw new BadRequestException(
        `${metadata.data} must be no more than ${this.maxLength} characters`
      );
    }
    return value;
  }
}
