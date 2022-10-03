import {Controller, Get} from '@nestjs/common';
import {BoardService} from "./board.service";

@Controller('board')
export class BoardController {
  private _boardService: BoardService

  constructor(boardService: BoardService) {
    this._boardService = boardService;
  }

  @Get('/')
  public getAllBoard() {
    return this._boardService.getAllBoards();
  }
}
