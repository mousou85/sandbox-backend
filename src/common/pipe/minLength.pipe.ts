import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';

/**
 * 문자열 최소길이 제한 파이프
 */
@Injectable()
export class MinLengthPipe implements PipeTransform {
  private readonly minLength: number;
  constructor(minLength: number) {
    this.minLength = minLength;
  }
  transform(value: string, metadata: ArgumentMetadata): any {
    if (value === undefined || value === null) {
      throw new BadRequestException(`${metadata.data} should not be empty`);
    }
    if (value.length < this.minLength) {
      throw new BadRequestException(
        `${metadata.data} must be at least ${this.minLength} characters`
      );
    }
    return value;
  }
}
