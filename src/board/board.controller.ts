import {Controller, Get} from '@nestjs/common';
import {BoardService} from "./board.service";
import {BoardModel} from "./board.model";

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
}
