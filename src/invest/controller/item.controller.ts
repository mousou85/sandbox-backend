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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {User} from '@app/auth/auth.decorator';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {AuthUserDto} from '@app/auth/dto';
import {
  CreateInvestItemDto,
  InvestItemDto,
  InvestItemDtoSimple,
  InvestUnitDto,
} from '@app/invest/dto';
import {EInvestItemTypeLabel} from '@app/invest/invest.enum';
import {InvestItemService} from '@app/invest/service';
import {ApiListResponse, ApiOkResponseCustom} from '@common/decorator/swagger';
import {ListResponseDto, OkResponseDto} from '@common/dto';
import {DataNotFoundException} from '@common/exception';
import {RequiredPipe} from '@common/pipe';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/item')
export class ItemController {
  constructor(
    @Inject(Logger) private logger: LoggerService,
    private investItemService: InvestItemService
  ) {}

  @ApiOperation({summary: '상품 타입 리스트 조회'})
  @ApiOkResponseCustom({
    customProperties: Object.entries(EInvestItemTypeLabel).reduce((obj, [key, val]) => {
      return Object.assign(obj, {[key]: {type: 'string', example: val}});
    }, {}),
  })
  @Get('/item-type')
  async getItemType(@User() user: AuthUserDto): Promise<OkResponseDto<any>> {
    return new OkResponseDto(EInvestItemTypeLabel);
  }

  @ApiOperation({summary: '상품 리스트 조회'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiExtraModels(InvestUnitDto)
  @ApiListResponse({model: InvestItemDto})
  @Get('/')
  async getItemList(@User() user: AuthUserDto): Promise<ListResponseDto<InvestItemDto>> {
    //set vars: 상품 목록
    const {list: itemList, totalCount: itemTotalCount} = await this.investItemService.getItemList(
      {user_idx: user.userIdx},
      {getAll: true, sort: {column: 'item.item_idx', direction: 'ASC'}},
      {investUnit: true}
    );

    //dto 생성
    const resDto = new ListResponseDto(InvestItemDto).setTotalCount(itemTotalCount);

    //응답 데이터 리스트에 데이터 세팅
    resDto.data.list = await Promise.all(
      itemList.map(async (item) => {
        //set vars: 상품 dto
        const itemDto = new InvestItemDto(item);

        //상품 dto에 사용 가능 단위 목록 세팅
        itemDto.unitList = item.investUnit.map((unit) => new InvestUnitDto(unit));

        return itemDto;
      })
    );

    return resDto;
  }

  @ApiOperation({summary: '상품 조회'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiOkResponseCustom({model: InvestItemDto})
  @Get('/:itemIdx(\\d+)')
  async getItem(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number
  ): Promise<OkResponseDto<InvestItemDto>> {
    //set vars: 상품 데이터
    const itemEntity = await this.investItemService.getItem(
      {item_idx: itemIdx, user_idx: user.userIdx},
      {investUnit: true}
    );
    if (!itemEntity) throw new DataNotFoundException('invest item');

    //set vars: 상품 dto
    const itemDto = new InvestItemDto(itemEntity);

    //상품 dto에 사용 가능 단위 목록 세팅
    itemDto.unitList = itemEntity.investUnit.map((unit) => new InvestUnitDto(unit));

    return new OkResponseDto(itemDto);
  }

  @ApiOperation({summary: '상품 데이터 추가'})
  @ApiBody({type: CreateInvestItemDto})
  @ApiOkResponseCustom({model: InvestItemDtoSimple})
  @Post('/')
  @HttpCode(200)
  async createItem(@User() user: AuthUserDto, @Body() createDto: CreateInvestItemDto) {}
}
