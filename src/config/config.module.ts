import {Module} from '@nestjs/common';
import {TypeOrmOptionService} from '@config/service';

@Module({
  providers: [TypeOrmOptionService],
})
export class ConfigModule {}
