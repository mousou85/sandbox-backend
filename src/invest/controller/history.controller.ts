import {
  Controller,
  Get,
  Inject,
  Logger,
  LoggerService,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';

import {User} from '@app/auth/auth.decorator';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {AuthUserDto} from '@app/auth/dto';
import {InvestHistoryDto} from '@app/invest/dto';
import {InvestHistoryService} from '@app/invest/service';
import {ApiOkResponseCustom} from '@common/decorator/swagger';
import {OkResponseDto} from '@common/dto';
import {DataNotFoundException} from '@common/exception';
import {RequiredPipe} from '@common/pipe';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/history')
export class HistoryController {
  constructor(
    @Inject(Logger) private logger: LoggerService,
    private investHistoryService: InvestHistoryService
  ) {}

  @ApiOperation({summary: '히스토리 조회'})
  @ApiParam({name: 'historyIdx', required: true, description: '히스토리 IDX', type: 'number'})
  @ApiOkResponseCustom({model: InvestHistoryDto})
  @Get('/:historyIdx(\\d+)')
  async getHistory(
    @User() user: AuthUserDto,
    @Param('historyIdx', new RequiredPipe(), new ParseIntPipe()) historyIdx: number
  ): Promise<OkResponseDto<InvestHistoryDto>> {
    //set vars: 히스토리 데이터
    const historyEntity = await this.investHistoryService.getHistory(
      {
        history_idx: historyIdx,
        user_idx: user.userIdx,
      },
      {investUnit: true}
    );
    if (!historyEntity) throw new DataNotFoundException('invest history');

    //set vars: dto
    const historyDto = new InvestHistoryDto(historyEntity);

    return new OkResponseDto(historyDto);
  }
}
