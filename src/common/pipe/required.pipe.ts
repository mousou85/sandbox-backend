import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';

/**
 * 필수입력 파라미터 파이프
 */
@Injectable()
export class RequiredPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (value === undefined || value === null) {
      throw new BadRequestException(`${metadata.data} should not be empty`);
    }
    return value;
  }
}
