import {Injectable} from '@nestjs/common';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {UserEntity, UserLoginLogEntity, UserPasswordSaltEntity} from '@db/entity';
import {TypeORMLogger} from '@common/logger';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(
    connectionName?: string
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const loggingOptions = {
      logging: false,
      logger: null,
    };
    if (this.configService.get('LOGGER_DB') == 'true') {
      loggingOptions.logging = true;
      loggingOptions.logger = new TypeORMLogger();
    }

    return {
      type: 'mysql',
      host: this.configService.get('MYSQL_HOST'),
      port: this.configService.get('MYSQL_PORT'),
      database: this.configService.get('MYSQL_DATABASE'),
      username: this.configService.get('MYSQL_USER'),
      password: this.configService.get('MYSQL_PASSWORD'),
      synchronize: false,
      dateStrings: false,
      timezone: '+09:00',
      entities: [UserEntity, UserLoginLogEntity, UserPasswordSaltEntity],
      ...loggingOptions,
    };
  }
}
