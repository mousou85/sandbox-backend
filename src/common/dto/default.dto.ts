import {Exclude, instanceToPlain, plainToClassFromExist} from 'class-transformer';

/**
 * default dto
 */
export class DefaultDto<T> {
  @Exclude()
  fromInstance(instance: T): this {
    const plain = instanceToPlain(instance);
    plainToClassFromExist(this, plain, {excludeExtraneousValues: true});
    return this;
  }
}
