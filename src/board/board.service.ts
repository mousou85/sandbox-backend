import {Injectable, NotFoundException} from '@nestjs/common';
import {BoardModel, BoardStatus} from "./board.model";
import {v1 as uuid} from 'uuid';
import {CreateBoardDto} from "./dto/CreateBoard.dto";

@Injectable()
export class BoardService
{
  private _boards: BoardModel[] = [];

  public getAllBoards(): BoardModel[]
  {
    return this._boards;
  }

  public createBoard(createBoardDto: CreateBoardDto)
  {
    const {title, desc} = createBoardDto;

    const board: BoardModel = {
      id: uuid(),
      title: title,
      desc: desc,
      status: BoardStatus.PUBLIC
    };

    this._boards.push(board);
    return board;
  }

  public getBoardById(id: string): BoardModel
  {
    const found = this._boards.find((board) => board.id == id);
    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }

  public deleteBoard(id: string): void
  {
    const found = this.getBoardById(id);

    this._boards = this._boards.filter((board) => board.id != found.id);
  }

  public updateBoardStatus(id: string, status: BoardStatus): BoardModel
  {
    const board = this.getBoardById(id);
    board.status = status;
    return board;
  }
}
