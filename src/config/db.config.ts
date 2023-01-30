import {registerAs} from '@nestjs/config';
import process from 'process';

interface ITypeOrmConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  logging: boolean;
}

export const typeOrmConfig = registerAs('typeOrm', (): ITypeOrmConfig => {
  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: process.env.LOGGER_DB == 'true',
  };
});
