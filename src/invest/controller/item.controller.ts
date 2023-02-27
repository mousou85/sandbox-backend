import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Controller, Get, Inject, Logger, LoggerService, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {AuthUserDto} from '@app/auth/dto';
import {InvestItemService} from '@app/invest/service';
import {OkResponseDto} from '@common/dto';
import {ApiOkResponseCustom} from '@common/decorator/swagger';
import {EInvestItemType} from '@db/db.enum';

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
    customProperties: Object.values(EInvestItemType).reduce((obj, curVal) => {
      return Object.assign(obj, {[curVal]: {type: 'string'}});
    }, {}),
  })
  @Get('/item-type')
  async getGroupList(@User() user: AuthUserDto): Promise<OkResponseDto<any>> {
    const itemTypeList = InvestItemService.getItemTypeList();

    return new OkResponseDto(itemTypeList);
  }
}
