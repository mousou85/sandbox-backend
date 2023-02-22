import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Controller, Get, Inject, Logger, LoggerService, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {AuthUserDto} from '@app/auth/dto';
import {InvestGroupService} from '@app/invest/service';
import {InvestGroupDto} from '@app/invest/dto';
import {ApiListResponse} from '@common/decorator/swagger';
import {ListResponseDto} from '@common/dto';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/group')
export class GroupController {
  constructor(
    @Inject(Logger) private logger: LoggerService,
    private investGroupService: InvestGroupService
  ) {}

  @ApiOperation({summary: '상품 그룹 리스트 조회'})
  @ApiListResponse({model: InvestGroupDto})
  @Get('/')
  async getGroupList(@User() user: AuthUserDto): Promise<ListResponseDto<InvestGroupDto>> {
    const {list: groupList, totalCount} = await this.investGroupService.getGroupList(
      user.userIdx,
      {getAll: true},
      {investItem: true}
    );

    const resDto = new ListResponseDto(InvestGroupDto, null, totalCount);
    for (const group of groupList) {
      const dto = new InvestGroupDto(group);
      await dto.validate();
      resDto.data.list.push(dto);
    }

    return resDto;
  }
}
