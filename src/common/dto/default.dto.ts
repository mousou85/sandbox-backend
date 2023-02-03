import {Exclude} from 'class-transformer';
import {DtoHelper} from '@common/helper';

/**
 * default dto
 */
export class DefaultDto<T> {
  @Exclude()
  fromInstance(instance: T): this {
    DtoHelper.transformForExistsDto(instance, this);
    return this;
  }
}
