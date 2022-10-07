import {Repository} from "typeorm";
import {BoardEntity, BoardStatus} from "./board.entity";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {CreateBoardDto} from "./dto/CreateBoard.dto";
import {UserEntity} from "../auth/entities/user.entity";

@Injectable()
export class BoardRepository extends Repository<BoardEntity>{
  constructor(@InjectRepository(BoardEntity) repository: Repository<BoardEntity>) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async getById(id: number): Promise<BoardEntity>
  {
    return this.findOneBy({id: id});
  }

  public async createBoard(createBoardDto: CreateBoardDto, user: UserEntity): Promise<BoardEntity>
  {
    const {title, desc} = createBoardDto;
    const board = this.create({
      title: title,
      desc: desc,
      status: BoardStatus.PUBLIC,
      user: user,
    });

    await this.save(board);

    return board;
  }
}


