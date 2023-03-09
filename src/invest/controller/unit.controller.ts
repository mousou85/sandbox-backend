import {
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
import {ApiBearerAuth, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';

import {User} from '@app/auth/auth.decorator';
import {JwtAuthGuard} from '@app/auth/authGuard';
import {AuthUserDto} from '@app/auth/dto';
import {CreateInvestUnitDto, InvestUnitDto, UpdateInvestUnitDto} from '@app/invest/dto';
import {InvestUnitService} from '@app/invest/service';
import {ApiConsumesCustom, ApiListResponse, ApiOkResponseCustom} from '@common/decorator/swagger';
import {ListResponseDto, OkResponseDto} from '@common/dto';
import {DataNotFoundException} from '@common/exception';
import {RequiredPipe} from '@common/pipe';

@ApiTags('투자 히스토리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/invest-history/unit')
export class UnitController {
  constructor(
    @Inject(Logger)
    private logger: LoggerService,
    private investUnitService: InvestUnitService
  ) {}

  @ApiOperation({summary: '단위 리스트 조회'})
  @ApiListResponse({model: InvestUnitDto})
  @Get('/')
  async getUnitList(@User() user: AuthUserDto): Promise<ListResponseDto<InvestUnitDto>> {
    //set vars: 상품 목록
    const {list: unitList, totalCount: unitTotalCount} = await this.investUnitService.getUnitList(
      {user_idx: user.userIdx},
      {getAll: true, sort: {column: 'unit.unit_idx', direction: 'ASC'}}
    );

    //dto 생성
    const resDto = new ListResponseDto(InvestUnitDto).setTotalCount(unitTotalCount);

    //응답 데이터 리스트에 데이터 세팅
    resDto.data.list = await Promise.all(
      unitList.map(async (unit) => {
        return new InvestUnitDto(unit);
      })
    );

    return resDto;
  }

  @ApiOperation({summary: '단위 조회'})
  @ApiParam({name: 'unitIdx', required: true, description: '단위 IDX', type: 'number'})
  @ApiOkResponseCustom({model: InvestUnitDto})
  @Get('/:unitIdx(\\d+)')
  async getUnit(
    @User() user: AuthUserDto,
    @Param('unitIdx', new RequiredPipe(), new ParseIntPipe()) unitIdx: number
  ): Promise<OkResponseDto<InvestUnitDto>> {
    //set vars: 단위 데이터
    const unitEntity = await this.investUnitService.getUnit({
      unit_idx: unitIdx,
      user_idx: user.userIdx,
    });
    if (!unitEntity) throw new DataNotFoundException('invest unit');

    //set vars: 단위 dto
    const unitDto = new InvestUnitDto(unitEntity);

    return new OkResponseDto(unitDto);
  }
  @ApiOperation({summary: '단위 데이터 추가'})
  @ApiConsumesCustom()
  @ApiOkResponseCustom({model: InvestUnitDto})
  @Post('/')
  @HttpCode(200)
  async createUnit(
    @User() user: AuthUserDto,
    @Body() createDto: CreateInvestUnitDto
  ): Promise<OkResponseDto<InvestUnitDto>> {
    //단위 insert
    const unitEntity = await this.investUnitService.createUnit(user.userIdx, createDto);

    //set vars: dto
    const unitDto = new InvestUnitDto(unitEntity);

    return new OkResponseDto(unitDto);
  }

  @ApiOperation({summary: '단위 데이터 수정'})
  @ApiConsumesCustom()
  @ApiParam({name: 'unitIdx', required: true, description: '단위 IDX', type: 'number'})
  @ApiOkResponseCustom({model: InvestUnitDto})
  @Patch('/:unitIdx(\\d+)')
  async updateUnit(
    @User() user: AuthUserDto,
    @Param('unitIdx', new RequiredPipe(), new ParseIntPipe()) unitIdx: number,
    @Body() updateDto: UpdateInvestUnitDto
  ): Promise<OkResponseDto<InvestUnitDto>> {
    //단위 update
    const unitEntity = await this.investUnitService.updateUnit(user.userIdx, unitIdx, updateDto);

    //set vars: dto
    const unitDto = new InvestUnitDto(unitEntity);

    return new OkResponseDto(unitDto);
  }

  @ApiOperation({summary: '단위 데이터 삭제'})
  @ApiParam({name: 'unitIdx', required: true, description: '단위 IDX', type: 'number'})
  @ApiOkResponseCustom({model: null})
  @Delete('/:unitIdx(\\d+)')
  async deleteUnit(
    @User() user: AuthUserDto,
    @Param('unitIdx', new RequiredPipe(), new ParseIntPipe()) unitIdx: number
  ): Promise<OkResponseDto<void>> {
    //데이터 유무 체크
    const hasUnit = await this.investUnitService.hasUnit({
      user_idx: user.userIdx,
      unit_idx: unitIdx,
    });
    if (!hasUnit) throw new DataNotFoundException('invest unit');

    //단위 delete
    await this.investUnitService.deleteUnit(unitIdx);

    return new OkResponseDto();
  }
}
