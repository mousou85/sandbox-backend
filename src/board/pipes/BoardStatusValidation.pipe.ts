import {ArgumentMetadata, BadRequestException, PipeTransform} from "@nestjs/common";
import {BoardStatus} from "../board.model";

export class BoardStatusValidationPipe implements PipeTransform
{
  public readonly StatusOptions = [
    BoardStatus.PUBLIC,
    BoardStatus.PUBLIC
  ];

  transform(value: any, metadata: ArgumentMetadata): any
  {
    if (!this._isStatusValid(value)) {
      throw new BadRequestException();
    }
    return value;
  }

  private _isStatusValid(status: any): boolean
  {
    const isValid = this.StatusOptions.indexOf(status);
    return isValid !== -1;
  }
}