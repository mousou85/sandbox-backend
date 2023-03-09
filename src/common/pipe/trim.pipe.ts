import {ArgumentMetadata, Injectable, PipeTransform} from '@nestjs/common';
import {isDefined, isString} from 'class-validator';

import {CommonHelper} from '@common/helper';

type TTrimType = 'both' | 'left' | 'right';

/**
 * 문자열 trim 파이프
 */
@Injectable()
export class TrimPipe implements PipeTransform {
  private readonly trimType: TTrimType;
  constructor(trimType: TTrimType = 'both') {
    this.trimType = trimType;
  }
  transform(value: unknown, metadata: ArgumentMetadata): any {
    if (isDefined(value) && isString(value)) {
      if (this.trimType == 'both') value = value.trim();
      else if (this.trimType == 'left') value = CommonHelper.lTrim(value);
      else if (this.trimType == 'right') value = CommonHelper.rTrim(value);
    }

    return value;
  }
}
