import {Module} from '@nestjs/common';
import {TypeOrmConfigService} from '@config';

@Module({
  providers: [TypeOrmConfigService],
})
export class ConfigModule {}
