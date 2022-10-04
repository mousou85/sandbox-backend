import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {BoardService} from "./board.service";
import {BoardModel, BoardStatus} from "./board.model";
import {CreateBoardDto} from "./dto/CreateBoard.dto";
import {BoardStatusValidationPipe} from "./pipes/BoardStatusValidation.pipe";

@Controller('board')
export class BoardController {
  private _boardService: BoardService

  constructor(boardService: BoardService)
  {
    this._boardService = boardService;
  }

  @Get('/')
  public getAllBoard(): BoardModel[]
  {
    return this._boardService.getAllBoards();
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  public createBoard(@Body() createBoardDto: CreateBoardDto): BoardModel
  {
    return this._boardService.createBoard(createBoardDto);
  }

  @Get('/:id')
  public getBoardById(@Param('id') id: string): BoardModel
  {
    return this._boardService.getBoardById(id);
  }

  @Delete('/:id')
  public deleteBoard(@Param('id') id: string): void
  {
    this._boardService.deleteBoard(id);
  }

  @Patch('/:id/status')
  public updateBoardStatus(
    @Param('id') id: string,
    @Body('status', BoardStatusValidationPipe) status: BoardStatus
  ): BoardModel
  {
    return this._boardService.updateBoardStatus(id, status);
  }
}
