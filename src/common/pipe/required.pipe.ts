import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {isDefined} from 'class-validator';

/**
 * 필수입력 파라미터 파이프
 */
@Injectable()
export class RequiredPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (!isDefined(value)) {
      throw new BadRequestException(`${metadata.data} should not be empty`);
    }
    return value;
  }
}
