import {ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
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
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {User} from '@app/auth/auth.decorator';
import {AuthUserDto} from '@app/auth/dto';
import {InvestGroupService, InvestItemService, InvestUnitService} from '@app/invest/service';
import {
  CreateInvestGroupDto,
  InvestGroupDto,
  InvestGroupDtoSimple,
  InvestItemDto,
  InvestUnitDto,
  UpdateInvestGroupDto,
} from '@app/invest/dto';
import {ApiListResponse, ApiOkResponseCustom} from '@common/decorator/swagger';
import {ListResponseDto, OkResponseDto} from '@common/dto';
import {RequiredPipe} from '@common/pipe';
import {DataNotFoundException} from '@common/exception';

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
      await this.investGroupService.getGroupList({user_idx: user.userIdx}, {getAll: true});

    //dto 생성
    const resDto = new ListResponseDto(InvestGroupDto).setTotalCount(groupTotalCount);

    //응답 데이터 리스트에 데이터 세팅
    resDto.data.list = await Promise.all(
      groupList.map(async (group) => {
        //set vars: 그룹 dto
        const groupDto = new InvestGroupDto(group);

        //set vars: 그룹에 속한 상품 목록
        const {list: itemList} = await this.investItemService.getItemList(
          {group_idx: group.group_idx},
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

  @ApiOperation({summary: '그룹 데이터 조회'})
  @ApiParam({name: 'groupIdx', description: '그룹 IDX', type: 'number', required: true})
  @ApiOkResponseCustom({model: InvestGroupDto})
  @Get('/:groupIdx(\\d+)')
  async getGroup(
    @User() user: AuthUserDto,
    @Param('groupIdx', new RequiredPipe(), new ParseIntPipe()) groupIdx: number
  ): Promise<OkResponseDto<InvestGroupDto>> {
    //set vars: 그룹 데이터
    const groupEntity = await this.investGroupService.getGroup({
      group_idx: groupIdx,
      user_idx: user.userIdx,
    });
    if (!groupEntity) {
      throw new DataNotFoundException('invest group');
    }

    //set vars: dto
    const groupDto = new InvestGroupDto(groupEntity);

    //set vars: 그룹에 속한 상품 목록
    const {list: itemList} = await this.investItemService.getItemList(
      {group_idx: groupEntity.group_idx},
      {getAll: true},
      {investUnit: true}
    );

    //그룹 dto에 상품 목록 세팅
    groupDto.itemList = await Promise.all(
      itemList.map(async (item) => {
        //set vars: 상품 dto
        const itemDto = new InvestItemDto(item);

        //상품 dto에 사용 가능 단위 목록 세팅
        itemDto.unitList = item.investUnit.map((unit) => new InvestUnitDto(unit));

        return itemDto;
      })
    );

    return new OkResponseDto(groupDto);
  }

  @ApiOperation({summary: '그룹 데이터 추가'})
  @ApiBody({type: CreateInvestGroupDto})
  @ApiOkResponseCustom({model: InvestGroupDtoSimple})
  @Post('/')
  @HttpCode(200)
  async createGroup(
    @User() user: AuthUserDto,
    @Body() createDto: CreateInvestGroupDto
  ): Promise<OkResponseDto<InvestGroupDtoSimple>> {
    //중복 체크
    const isDuplicate = await this.investGroupService.hasGroup({
      user_idx: user.userIdx,
      group_name: {op: 'match', value: createDto.groupName},
    });
    if (isDuplicate) {
      throw new BadRequestException('Invest group name is duplicated');
    }

    //그룹 생성
    const groupEntity = await this.investGroupService.createGroup(user.userIdx, createDto);

    //set vars: 그룹 dto
    const groupDto = new InvestGroupDtoSimple(groupEntity);

    return new OkResponseDto(groupDto);
  }

  @ApiOperation({summary: '그룹 데이터 수정'})
  @ApiParam({name: 'groupIdx', description: '그룹 IDX', type: 'number', required: true})
  @ApiBody({type: UpdateInvestGroupDto})
  @ApiOkResponseCustom({model: InvestGroupDtoSimple})
  @Patch('/:groupIdx(\\d+)')
  async updateGroup(
    @User() user: AuthUserDto,
    @Param('groupIdx', new RequiredPipe(), new ParseIntPipe()) groupIdx: number,
    @Body() updateDto: UpdateInvestGroupDto
  ): Promise<OkResponseDto<InvestGroupDtoSimple>> {
    //데이터 유무 체크
    const hasData = await this.investGroupService.hasGroup({
      group_idx: groupIdx,
      user_idx: user.userIdx,
    });
    if (!hasData) throw new DataNotFoundException('invest group');

    //그룹 수정
    const groupEntity = await this.investGroupService.updateGroup(groupIdx, updateDto);

    //set vars: 그룹 dto
    const groupDto = new InvestGroupDtoSimple(groupEntity);

    return new OkResponseDto(groupDto);
  }

  @ApiOperation({summary: '그룹 데이터 삭제'})
  @ApiParam({name: 'groupIdx', description: '그룹 IDX', type: 'number', required: true})
  @ApiOkResponseCustom({model: null})
  @Delete('/:groupIdx(\\d+)')
  async deleteGroup(
    @User() user: AuthUserDto,
    @Param('groupIdx', new RequiredPipe(), new ParseIntPipe()) groupIdx: number
  ): Promise<OkResponseDto<void>> {
    //데이터 유무 체크
    const hasData = await this.investGroupService.hasGroup({
      group_idx: groupIdx,
      user_idx: user.userIdx,
    });
    if (!hasData) throw new DataNotFoundException('invest group');

    //그룹에 속한 상품 있는지 체크
    const hasItem = await this.investItemService.hasItem({group_idx: groupIdx});
    if (hasItem) throw new BadRequestException('Cannot delete group where item exists');

    //그룹 삭제
    await this.investGroupService.deleteGroup(groupIdx);

    return new OkResponseDto();
  }
}
