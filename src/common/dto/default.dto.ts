import {Exclude} from 'class-transformer';
import {ValidatorOptions} from 'class-validator';

import {DtoHelper} from '@common/helper';

/**
 * default dto
 */
export class DefaultDto {
  @Exclude()
  async validate(validatorOptions?: ValidatorOptions) {
    await DtoHelper.validate(this, validatorOptions);
  }
}
