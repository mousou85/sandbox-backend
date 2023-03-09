import {Inject, Injectable} from '@nestjs/common';
import {ConfigType} from '@nestjs/config';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';

import {TypeORMLogger} from '@common/logger';
import {typeOrmConfig} from '@config';

@Injectable()
export class TypeOrmOptionService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(typeOrmConfig.KEY)
    private config: ConfigType<typeof typeOrmConfig>
  ) {}

  createTypeOrmOptions(
    connectionName?: string
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      username: this.config.user,
      password: this.config.password,
      synchronize: false,
      dateStrings: false,
      timezone: '+09:00',
      logging: this.config.logging,
      logger: this.config.logging ? new TypeORMLogger() : null,
      entities: this.config.entities,
    };
  }
}
