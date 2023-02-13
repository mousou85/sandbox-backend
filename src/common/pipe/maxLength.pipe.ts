import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {isDefined, isString} from 'class-validator';

/**
 * 문자열 최대길이 제한 파이프
 */
@Injectable()
export class MaxLengthPipe implements PipeTransform {
  private readonly maxLength: number;
  constructor(maxLength: number) {
    this.maxLength = maxLength;
  }
  transform(value: unknown, metadata: ArgumentMetadata): any {
    if (!isDefined(value)) {
      throw new BadRequestException(`${metadata.data} should not be empty`);
    }
    if (!isString(value)) {
      throw new BadRequestException(`${metadata.data} must be a string`);
    }

    if ((value as string).length > this.maxLength) {
      throw new BadRequestException(
        `${metadata.data} must be no more than ${this.maxLength} characters`
      );
    }
    return value;
  }
}
