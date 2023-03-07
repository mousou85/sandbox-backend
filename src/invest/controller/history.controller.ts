import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  LoggerService,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';

import {User} from '@app/auth/auth.decorator';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {AuthUserDto} from '@app/auth/dto';
import {
  CreateInvestHistoryDto,
  InvestHistoryDto,
  InvestHistoryDtoSimple,
  UrlQueryInvestHistoryListDto,
} from '@app/invest/dto';
import {InvestHistoryService, InvestItemService, InvestSummaryService} from '@app/invest/service';
import {ApiConsumesCustom, ApiListResponse, ApiOkResponseCustom} from '@common/decorator/swagger';
import {ListResponseDto, OkResponseDto} from '@common/dto';
import {DataNotFoundException} from '@common/exception';
import {DateHelper} from '@common/helper';
import {RequiredPipe} from '@common/pipe';
import {IInvestHistoryCondition} from '@db/repository';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/history')
export class HistoryController {
  constructor(
    @Inject(Logger) private logger: LoggerService,
    private investHistoryService: InvestHistoryService,
    private investItemService: InvestItemService,
    private investSummaryService: InvestSummaryService
  ) {}

  @ApiOperation({summary: '히스토리 리스트 조회'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiListResponse({model: InvestHistoryDto})
  @Get('/:itemIdx(\\d+)/list')
  async getHistoryList(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Query() urlQuery: UrlQueryInvestHistoryListDto
  ): Promise<ListResponseDto<InvestHistoryDto>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //set vars: 검색 조건
    const queryCondition: IInvestHistoryCondition = {
      item_idx: itemIdx,
    };
    if (urlQuery.historyType) queryCondition.history_type = urlQuery.historyType;
    if (urlQuery.unit) queryCondition.unit = urlQuery.unit;
    if (urlQuery.historyMonth) {
      queryCondition.history_date = {
        begin: `${urlQuery.historyMonth}-01`,
        end: DateHelper.endOfMonth(`${urlQuery.historyMonth}-01`),
      };
    }

    //set vars: 히스토리 리스트
    const {list: historyList, totalCount: historyTotalCount} =
      await this.investHistoryService.getHistoryList(
        queryCondition,
        {getAll: true},
        {investUnit: true}
      );

    //set vars: 히스토리 리스트 dto
    const resListDto = new ListResponseDto<InvestHistoryDto>(InvestHistoryDto).setTotalCount(
      historyTotalCount
    );
    resListDto.data.list = historyList.map((history) => {
      return new InvestHistoryDto(history);
    });

    return resListDto;
  }

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

  @ApiOperation({summary: '히스토리 생성'})
  @ApiConsumesCustom()
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiOkResponseCustom({model: InvestHistoryDtoSimple})
  @Post('/:itemIdx(\\d+)')
  @HttpCode(200)
  async createHistory(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Body() createDto: CreateInvestHistoryDto
  ) {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //히스토리 생성
    const historyEntity = await this.investHistoryService.createHistory(itemIdx, createDto);

    //set vars: dto
    const historyDto = new InvestHistoryDtoSimple(historyEntity);

    return new OkResponseDto(historyDto);
  }
}
