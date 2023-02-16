import {registerAs} from '@nestjs/config';
import process from 'process';
import {MixedList} from 'typeorm/common/MixedList';
import {EntitySchema} from 'typeorm/entity-schema/EntitySchema';
import {
  InvestCompanyEntity,
  InvestGroupEntity,
  InvestGroupItemEntity,
  InvestHistoryEntity,
  InvestItemEntity,
  InvestSummaryEntity,
  InvestUnitEntity,
  InvestUnitSetEntity,
  UserEntity,
  UserLoginLogEntity,
  UserOtpEntity,
  UserPasswordSaltEntity,
} from '@db/entity';

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
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
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
      InvestHistoryEntity,
      InvestItemEntity,
      InvestSummaryEntity,
      InvestUnitEntity,
      InvestUnitSetEntity,
    ],
  };
});
