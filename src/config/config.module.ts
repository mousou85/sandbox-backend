import {Module} from '@nestjs/common';

import {TypeOrmOptionService} from '@config';

@Module({
  providers: [TypeOrmOptionService],
})
export class ConfigModule {}
