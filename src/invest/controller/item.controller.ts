import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Controller, Inject, Logger, LoggerService, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '@app/auth/authGuard';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/item')
export class ItemController {
  constructor(@Inject(Logger) private logger: LoggerService) {}
}
