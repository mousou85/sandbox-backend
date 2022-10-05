import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateBoardDto} from "./dto/CreateBoard.dto";
import {BoardEntity, BoardStatus} from "./board.entity";
import {BoardRepository} from "./board.repository";

@Injectable()
export class BoardService
{
  private _boardRepository: BoardRepository;

  constructor(boardRepository: BoardRepository)
  {
    this._boardRepository = boardRepository;
  }

  public async getBoardById(id: number): Promise<BoardEntity>
  {
    const found = await this._boardRepository.getById(id);
    if (!found) {
      throw new NotFoundException(`Can't find board with id ${id}`);
    }
    return found;
  }

  public async createBoard(createBoardDto: CreateBoardDto): Promise<BoardEntity>
  {
    return this._boardRepository.createBoard(createBoardDto);
  }
  //
  // public getBoardById(id: string): BoardModel
  // {
  //   const found = this._boards.find((board) => board.id == id);
  //   if (!found) {
  //     throw new NotFoundException();
  //   }
  //
  //   return found;
  // }
  //
  // public deleteBoard(id: string): void
  // {
  //   const found = this.getBoardById(id);
  //
  //   this._boards = this._boards.filter((board) => board.id != found.id);
  // }
  //
  // public updateBoardStatus(id: string, status: BoardStatus): BoardModel
  // {
  //   const board = this.getBoardById(id);
  //   board.status = status;
  //   return board;
  // }
}
