import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardService {
  private _boards = [];

  public getAllBoards() {
    return this._boards;
  }
}
