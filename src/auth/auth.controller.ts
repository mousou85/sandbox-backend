import {Body, Controller, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {CreateUserDto} from "./dto/CreateUser.dto";
import {UserEntity} from "./entities/user.entity";

@Controller('auth')
export class AuthController {
  private _authService: AuthService;

  constructor(authService: AuthService)
  {
    this._authService = authService;
  }

  @Post('/register')
  @UsePipes(ValidationPipe)
  public async signup(@Body() createUserDto: CreateUserDto): Promise<UserEntity>
  {
    return this._authService.createUser(createUserDto);
  }
}
