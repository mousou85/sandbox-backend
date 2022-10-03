import { Injectable } from '@nestjs/common';
import {BoardModel} from "./board.model";

@Injectable()
export class BoardService
{
  private _boards: BoardModel[] = [];

  public getAllBoards(): BoardModel[]
  {
    return this._boards;
  }
}
