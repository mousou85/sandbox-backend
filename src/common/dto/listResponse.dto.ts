import {Exclude, Expose, Type} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {IsInt} from '@common/decorator/validate';
import {isArray, IsArray, isDefined, IsOptional, ValidateNested} from 'class-validator';
import {ResponseBaseDto} from '@common/dto';

class ListDto<T> {
  @Exclude()
  protected _type: Function;

  @ApiProperty({description: '총 데이터 갯수', required: false})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsOptional()
  totalCount: number;

  @ApiProperty({description: '총 페이지수', required: false})
  @Expose()
  @IsInt({allowEmptyString: false})
  @IsOptional()
  totalPage: number;

  @ApiProperty({description: 'list data'})
  @Expose()
  @IsArray()
  @ValidateNested({each: true})
  @Type((options) => (options.newObject as ListDto<T>)._type)
  list: T[] = [];

  constructor(model: Function, list?: T[], totalCount?: number, totalPage?: number) {
    this._type = model;
    if (isDefined(list) && isArray(list)) this.list = list;
    if (isDefined(totalCount)) this.totalCount = totalCount;
    if (isDefined(totalPage)) this.totalPage = totalPage;
  }
}

/**
 * list response dto
 */
export class ListResponseDto<T> extends ResponseBaseDto {
  @Expose()
  @ValidateNested()
  @Type(() => ListDto)
  data: ListDto<T>;

  constructor(type: {new (): T}, list?: T[], totalCount?: number, totalPage?: number) {
    super(true);
    this.data = new ListDto<T>(type, list, totalCount, totalPage);
  }

  /**
   * 총 데이터수 setter
   * @param totalCount
   */
  @Exclude()
  setTotalCount(totalCount: number): this {
    this.data.totalCount = totalCount;
    return this;
  }

  /**
   * 총 페이지수 setter
   * @param totalPage
   */
  @Exclude()
  setTotalPage(totalPage: number): this {
    this.data.totalPage = totalPage;
    return this;
  }
}
