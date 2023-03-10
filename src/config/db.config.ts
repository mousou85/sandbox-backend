import process from 'process';

import {registerAs} from '@nestjs/config';
import {MixedList} from 'typeorm/common/MixedList';
import {EntitySchema} from 'typeorm/entity-schema/EntitySchema';

import {
  InvestCompanyEntity,
  InvestGroupEntity,
  InvestGroupItemEntity,
  InvestGroupSummaryDateEntity,
  InvestGroupSummaryEntity,
  InvestHistoryEntity,
  InvestItemEntity,
  InvestSummaryDateEntity,
  InvestSummaryEntity,
  InvestUnitEntity,
  InvestUnitSetEntity,
} from '@app/invest/entity';
import {
  UserEntity,
  UserLoginLogEntity,
  UserOtpEntity,
  UserPasswordSaltEntity,
} from '@app/user/entity';

interface ITypeOrmConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  logging: boolean;
  entities: MixedList<Function | string | EntitySchema>;
}

export const typeOrmConfig = registerAs('typeOrm', (): ITypeOrmConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: process.env.LOGGER_DB == 'true',
    entities: [
      UserEntity,
      UserLoginLogEntity,
      UserPasswordSaltEntity,
      UserOtpEntity,
      InvestCompanyEntity,
      InvestGroupEntity,
      InvestGroupItemEntity,
      InvestGroupSummaryEntity,
      InvestGroupSummaryDateEntity,
      InvestHistoryEntity,
      InvestItemEntity,
      InvestSummaryEntity,
      InvestSummaryDateEntity,
      InvestUnitEntity,
      InvestUnitSetEntity,
    ],
  };
});
