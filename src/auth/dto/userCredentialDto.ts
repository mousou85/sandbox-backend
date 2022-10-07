import {IsNotEmpty} from "class-validator";

export class UserCredentialDto
{
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}