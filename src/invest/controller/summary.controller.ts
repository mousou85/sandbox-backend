import {
  Controller,
  Get,
  Inject,
  Logger,
  LoggerService,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags} from '@nestjs/swagger';

import {User} from '@app/auth/auth.decorator';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {AuthUserDto} from '@app/auth/dto';
import {
  InvestMonthlySummaryDto,
  InvestTotalSummaryDto,
  InvestYearlySummaryDto,
} from '@app/invest/dto';
import {InvestItemService, InvestSummaryService} from '@app/invest/service';
import {ApiOkResponseCustom} from '@common/decorator/swagger';
import {OkResponseDto} from '@common/dto';
import {DataNotFoundException} from '@common/exception';
import {DateHelper} from '@common/helper';
import {DefaultValuePipe, RequiredPipe, TrimPipe} from '@common/pipe';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/summary')
export class SummaryController {
  constructor(
    @Inject(Logger)
    private logger: LoggerService,
    private investSummaryService: InvestSummaryService,
    private investItemService: InvestItemService
  ) {}

  @ApiOperation({summary: '전체 요약 조회'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiQuery({
    name: 'unit',
    required: false,
    description: '단위(기본값: KRW)',
    type: 'string',
    example: 'KRW',
  })
  @ApiOkResponseCustom({model: InvestTotalSummaryDto})
  @Get('/:itemIdx(\\d+)/total')
  async getTotalSummary(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Query('unit', new TrimPipe(), new DefaultValuePipe('KRW')) unit: string
  ): Promise<OkResponseDto<InvestTotalSummaryDto>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //set vars: 요약 데이터
    const summaryEntity = await this.investSummaryService.getTotalSummary(itemIdx, unit);

    //set vars: dto
    const summaryDto = new InvestTotalSummaryDto(summaryEntity);

    return new OkResponseDto(summaryDto);
  }

  @ApiOperation({summary: '월간 요약 조회'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiQuery({
    name: 'unit',
    required: false,
    description: '단위(기본값: KRW)',
    type: 'string',
    example: 'KRW',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: '날짜(기본값: 오늘)',
    type: 'string',
    example: '2023-01-01',
  })
  @ApiOkResponseCustom({model: InvestMonthlySummaryDto})
  @Get('/:itemIdx(\\d+)/monthly')
  async getMonthlySummary(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Query('unit', new TrimPipe(), new DefaultValuePipe('KRW')) unit: string,
    @Query('date', new TrimPipe(), new DefaultValuePipe(DateHelper.now('YYYY-MM-DD'))) date: string
  ): Promise<OkResponseDto<InvestMonthlySummaryDto>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //set vars: 월간 요약 조회 일자
    date = DateHelper.format(date, 'YYYY-MM-01');

    //set vars: 요약 데이터
    const summaryEntity = await this.investSummaryService.getDateSummary(
      itemIdx,
      unit,
      'month',
      date
    );

    //set vars: dto
    const summaryDto = new InvestMonthlySummaryDto(summaryEntity);

    return new OkResponseDto(summaryDto);
  }

  @ApiOperation({summary: '년간 요약 조회'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiQuery({
    name: 'unit',
    required: false,
    description: '단위(기본값: KRW)',
    type: 'string',
    example: 'KRW',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: '년도(기본값: 올해)',
    type: 'string',
    example: '2023',
  })
  @ApiOkResponseCustom({model: InvestYearlySummaryDto})
  @Get('/:itemIdx(\\d+)/yearly')
  async getYearlySummary(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Query('unit', new TrimPipe(), new DefaultValuePipe('KRW')) unit: string,
    @Query('year', new TrimPipe(), new DefaultValuePipe(DateHelper.now('YYYY'))) year: string
  ): Promise<OkResponseDto<InvestYearlySummaryDto>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //set vars: 년간 요약 조회 일자
    const date = `${year}-01-01`;

    //set vars: 요약 데이터
    const summaryEntity = await this.investSummaryService.getDateSummary(
      itemIdx,
      unit,
      'year',
      date
    );

    //set vars: dto
    const summaryDto = new InvestYearlySummaryDto(summaryEntity);

    return new OkResponseDto(summaryDto);
  }

  @ApiOperation({
    summary: '요약 데이터 재생성',
    description: '사용자의 모든 상품의 요약 데이터를 재생성',
  })
  @ApiOkResponseCustom({model: null})
  @Get('/remake-all')
  async remakeSummary(@User() user: AuthUserDto): Promise<OkResponseDto<void>> {
    const {list: itemList} = await this.investItemService.getItemList(
      {user_idx: user.userIdx},
      {getAll: true}
    );

    //상품별로 처리
    for (const item of itemList) {
      await this.investSummaryService.remakeSummary(item.item_idx);
    }

    return new OkResponseDto();
  }
}
