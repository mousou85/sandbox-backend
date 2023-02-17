import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Controller, Get, Inject, Logger, LoggerService, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {AuthUserDto} from '@app/auth/dto';
import {InvestGroupService} from '@app/invest/service';

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
  // @ApiOkResponse({model: UserInfoDto})
  @Get('/')
  async getGroupList(@User() user: AuthUserDto) {}
}
