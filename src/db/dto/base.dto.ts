import {Exclude, instanceToPlain, plainToClassFromExist} from 'class-transformer';

export class BaseDto<T> {
  @Exclude()
  fromObject(object: T): this {
    const plain = instanceToPlain(object);
    plainToClassFromExist(this, plain, {excludeExtraneousValues: true});
    return this;
  }
}
