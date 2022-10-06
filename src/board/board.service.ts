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

  public async deleteBoard(id: number): Promise<void>
  {
    const result = await this._boardRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find board with id ${id}`);
    }
  }

  public async updateBoardStatus(id: number, status: BoardStatus): Promise<BoardEntity>
  {
    const board = await this.getBoardById(id);
    board.status = status;
    await this._boardRepository.save(board);

    return board;
  }

  public async getAllBoards(): Promise<BoardEntity[]>
  {
    return this._boardRepository.find();
  }
}
