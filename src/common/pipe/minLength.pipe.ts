import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {isDefined, isString} from 'class-validator';

/**
 * 문자열 최소길이 제한 파이프
 */
@Injectable()
export class MinLengthPipe implements PipeTransform {
  private readonly minLength: number;
  constructor(minLength: number) {
    this.minLength = minLength;
  }
  transform(value: unknown, metadata: ArgumentMetadata): any {
    if (!isDefined(value)) {
      throw new BadRequestException(`${metadata.data} should not be empty`);
    }
    if (!isString(value)) {
      throw new BadRequestException(`${metadata.data} must be a string`);
    }

    if ((value as string).length < this.minLength) {
      throw new BadRequestException(
        `${metadata.data} must be at least ${this.minLength} characters`
      );
    }
    return value;
  }
}
