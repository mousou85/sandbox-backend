import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Controller, Get, Inject, Logger, LoggerService, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {AuthUserDto} from '@app/auth/dto';
import {InvestGroupService, InvestItemService, InvestUnitService} from '@app/invest/service';
import {InvestGroupDto, InvestItemDto, InvestUnitDto} from '@app/invest/dto';
import {ApiListResponse} from '@common/decorator/swagger';
import {ListResponseDto} from '@common/dto';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/group')
export class GroupController {
  constructor(
    @Inject(Logger) private logger: LoggerService,
    private investGroupService: InvestGroupService,
    private investItemService: InvestItemService,
    private investUnitService: InvestUnitService
  ) {}

  @ApiOperation({summary: '상품 그룹 리스트 조회'})
  @ApiListResponse({model: InvestGroupDto})
  @Get('/')
  async getGroupList(@User() user: AuthUserDto): Promise<ListResponseDto<InvestGroupDto>> {
    //set vars: 상품 그룹 목록
    const {list: groupList, totalCount: groupTotalCount} =
      await this.investGroupService.getGroupList(user.userIdx, {getAll: true});

    //dto 생성
    const resDto = new ListResponseDto(InvestGroupDto).setTotalCount(groupTotalCount);

    //응답 데이터 리스트에 데이터 세팅
    resDto.data.list = await Promise.all(
      groupList.map(async (group) => {
        //set vars: 그룹 dto
        const groupDto = new InvestGroupDto(group);

        //set vars: 그룹에 속한 상품 목록
        const {list: itemList} = await this.investItemService.getItemList(
          group.group_idx,
          {getAll: true},
          {investUnit: true}
        );

        //그룹 dto에 상품 목록 세팅
        groupDto.itemList = itemList.map((item) => {
          //set vars: 상품 dto
          const itemDto = new InvestItemDto(item);

          //상품 dto에 사용 가능 단위 목록 세팅
          itemDto.unitList = item.investUnit.map((unit) => new InvestUnitDto(unit));

          return itemDto;
        });

        return groupDto;
      })
    );

    return resDto;
  }
}
