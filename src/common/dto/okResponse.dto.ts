import {ResponseBaseDto} from '@common/dto';
import {Expose} from 'class-transformer';

/**
 * success response dto
 */
export class OkResponseDto<T> extends ResponseBaseDto {
  @Expose()
  data?: T;

  constructor(data?: T) {
    super(true);
    if (data) this.data = data;
  }
}
