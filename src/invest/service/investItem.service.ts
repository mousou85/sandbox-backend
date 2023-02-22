import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {InvestItemRepository} from '@db/repository';

@Injectable()
export class InvestItemService {
  constructor(
    protected dataSource: DataSource,
    protected investItemRepository: InvestItemRepository
  ) {}
}
