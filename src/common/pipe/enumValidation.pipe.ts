import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {isDefined, isEnum} from 'class-validator';

/**
 * enum 값 유효성 체크 파이프
 */
@Injectable()
export class EnumValidationPipe implements PipeTransform<string, Promise<any>> {
  private readonly enumVal: any;
  constructor(enumVal: any) {
    this.enumVal = enumVal;
  }
  transform(value: string, metadata: ArgumentMetadata): any {
    if (isDefined(value) && isEnum(value, this.enumVal)) {
      return value;
    } else {
      const enumValList = Object.keys(this.enumVal).map((key) => this.enumVal[key]);
      const errorMessage = `the value ${value} is not valid. See the acceptable values: ${enumValList}`;
      throw new BadRequestException(errorMessage);
    }
  }
}
