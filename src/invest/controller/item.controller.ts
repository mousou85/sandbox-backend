import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  LoggerService,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
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
  UpdateInvestItemDto,
} from '@app/invest/dto';
import {EInvestItemTypeLabel} from '@app/invest/invest.enum';
import {InvestItemService, InvestUnitService} from '@app/invest/service';
import {
  ApiBodyCustom,
  ApiConsumesCustom,
  ApiListResponse,
  ApiOkResponseCustom,
} from '@common/decorator/swagger';
import {ListResponseDto, OkResponseDto} from '@common/dto';
import {DataNotFoundException} from '@common/exception';
import {RequiredPipe} from '@common/pipe';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/item')
export class ItemController {
  constructor(
    @Inject(Logger)
    private logger: LoggerService,
    private investItemService: InvestItemService,
    private investUnitService: InvestUnitService
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
    resDto.data.list = itemList.map((item) => {
      //set vars: 상품 dto
      const itemDto = new InvestItemDto(item);

      //상품 dto에 사용 가능 단위 목록 세팅
      itemDto.unitList = item.investUnit.map((unit) => new InvestUnitDto(unit));

      return itemDto;
    });

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
  @ApiConsumesCustom()
  @ApiBody({type: CreateInvestItemDto})
  @ApiOkResponseCustom({model: InvestItemDtoSimple})
  @Post('/')
  @HttpCode(200)
  async createItem(
    @User() user: AuthUserDto,
    @Body() createDto: CreateInvestItemDto
  ): Promise<OkResponseDto<InvestItemDtoSimple>> {
    //상품 insert
    const itemEntity = await this.investItemService.createItem(user.userIdx, createDto);

    //set vars: dto
    const itemDto = new InvestItemDtoSimple(itemEntity);

    return new OkResponseDto(itemDto);
  }

  @ApiOperation({summary: '상품 수정'})
  @ApiConsumesCustom()
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiBody({type: UpdateInvestItemDto})
  @ApiOkResponseCustom({model: InvestItemDtoSimple})
  @Patch('/:itemIdx(\\d+)')
  async updateItem(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Body() updateDto: UpdateInvestItemDto
  ): Promise<OkResponseDto<InvestItemDtoSimple>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //상품 update
    const itemEntity = await this.investItemService.updateItem(itemIdx, updateDto);

    //set vars: dto
    const itemDto = new InvestItemDtoSimple(itemEntity);

    return new OkResponseDto(itemDto);
  }

  @ApiOperation({summary: '상품 삭제'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiOkResponseCustom({model: null})
  @Delete('/:itemIdx(\\d+)')
  async deleteItem(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number
  ): Promise<OkResponseDto<void>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //상품 delete
    await this.investItemService.deleteItem(itemIdx);

    return new OkResponseDto();
  }

  @ApiOperation({summary: '상품에 등록된 단위 리스트 조회'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiListResponse({model: InvestUnitDto})
  @Get('/:itemIdx(\\d+)/unit')
  async getUnitList(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number
  ): Promise<ListResponseDto<InvestUnitDto>> {
    const investUnitList = await this.investItemService.getUnitList(itemIdx);

    const resDto = new ListResponseDto<InvestUnitDto>(InvestUnitDto);
    resDto.data.list = investUnitList.map((unit) => {
      return new InvestUnitDto(unit);
    });

    return resDto;
  }

  @ApiOperation({summary: '상품에 단위 추가'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiBodyCustom({
    unitIdxs: {
      description: '상품에 추가할 단위 IDX',
      type: 'array',
      items: {type: 'number'},
      example: [1, 2, 3],
    },
  })
  @ApiOkResponseCustom({model: null})
  @Post('/:itemIdx(\\d+)/unit')
  @HttpCode(200)
  async addUnit(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Body('unitIdxs', new RequiredPipe(), new ParseArrayPipe({items: Number})) unitIdxs: number[]
  ): Promise<OkResponseDto<void>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //본인 단위인지 확인
    const unitCount = await this.investUnitService.getUnitCount({
      unit_idx: unitIdxs,
      user_idx: user.userIdx,
    });
    if (unitIdxs.length != unitCount) {
      throw new BadRequestException('There are invalid units to');
    }

    //상품에 단위 추가
    await this.investItemService.addUnit(itemIdx, unitIdxs);

    return new OkResponseDto();
  }

  @ApiOperation({summary: '상품에 단위 제거'})
  @ApiParam({name: 'itemIdx', required: true, description: '상품 IDX', type: 'number'})
  @ApiBodyCustom({
    unitIdxs: {
      description: '상품에서 제거할 단위 IDX',
      type: 'array',
      items: {type: 'number'},
      example: [1, 2, 3],
    },
  })
  @ApiOkResponseCustom({model: null})
  @Delete('/:itemIdx(\\d+)/unit')
  async removeUnit(
    @User() user: AuthUserDto,
    @Param('itemIdx', new RequiredPipe(), new ParseIntPipe()) itemIdx: number,
    @Body('unitIdxs', new RequiredPipe(), new ParseArrayPipe({items: Number})) unitIdxs: number[]
  ): Promise<OkResponseDto<void>> {
    //상품 유무 확인
    const hasItem = await this.investItemService.hasItem({
      item_idx: itemIdx,
      user_idx: user.userIdx,
    });
    if (!hasItem) throw new DataNotFoundException('invest item');

    //본인 단위인지 확인
    const unitCount = await this.investUnitService.getUnitCount({
      unit_idx: unitIdxs,
      user_idx: user.userIdx,
    });
    if (unitIdxs.length != unitCount) {
      throw new BadRequestException('There are invalid units to');
    }

    //상품에 단위 제거
    await this.investItemService.removeUnit(itemIdx, unitIdxs);

    return new OkResponseDto();
  }
}
