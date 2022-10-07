import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {BoardService} from "./board.service";
import {CreateBoardDto} from "./dto/CreateBoard.dto";
import {BoardStatusValidationPipe} from "./pipes/BoardStatusValidation.pipe";
import {BoardEntity, BoardStatus} from "./board.entity";
import {AuthGuard} from "@nestjs/passport";

@Controller('board')
@UseGuards(AuthGuard())
export class BoardController {
  private _boardService: BoardService

  constructor(boardService: BoardService)
  {
    this._boardService = boardService;
  }

  @Get('/')
  public getAllBoard(): Promise<BoardEntity[]>
  {
    return this._boardService.getAllBoards();
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  public createBoard(@Body() createBoardDto: CreateBoardDto): Promise<BoardEntity>
  {
    return this._boardService.createBoard(createBoardDto);
  }

  @Get('/:id')
  public getBoardById(@Param('id') id: number): Promise<BoardEntity>
  {
    return this._boardService.getBoardById(id);
  }

  @Delete('/:id')
  public deleteBoard(@Param('id', ParseIntPipe) id: number): Promise<void>
  {
    return this._boardService.deleteBoard(id);
  }

  @Patch('/:id/status')
  public updateBoardStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', BoardStatusValidationPipe) status: BoardStatus
  ): Promise<BoardEntity>
  {
    return this._boardService.updateBoardStatus(id, status);
  }
}
