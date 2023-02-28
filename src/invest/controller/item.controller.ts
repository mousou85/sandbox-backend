import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
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
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {AuthUserDto} from '@app/auth/dto';
import {InvestItemService} from '@app/invest/service';
import {OkResponseDto} from '@common/dto';
import {ApiOkResponseCustom} from '@common/decorator/swagger';
import {RequiredPipe} from '@common/pipe';
import {DataNotFoundException} from '@common/exception';
import {InvestItemDto, InvestUnitDto} from '@app/invest/dto';
import {EInvestItemTypeLabel} from '@app/invest/invest.enum';

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
  async getGroupList(@User() user: AuthUserDto): Promise<OkResponseDto<any>> {
    return new OkResponseDto(EInvestItemTypeLabel);
  }

  @ApiOperation({summary: '상품 조회'})
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
    itemDto.unitList = itemEntity.investUnit.map((unit) => new InvestUnitDto(unit));

    return new OkResponseDto(itemDto);
  }
}
