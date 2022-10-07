import {Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {UserCredentialDto} from "./dto/userCredentialDto";
import {UserEntity} from "./entities/user.entity";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "./auth.decorator";

@Controller('auth')
export class AuthController {
  private _authService: AuthService;

  constructor(authService: AuthService)
  {
    this._authService = authService;
  }

  @Post('/register')
  @UsePipes(ValidationPipe)
  public async signup(@Body() userCredentialDto: UserCredentialDto): Promise<UserEntity>
  {
    return this._authService.createUser(userCredentialDto);
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  public async login(@Body() userCredentialDto: UserCredentialDto): Promise<{accessToken: string}>
  {
    return this._authService.login(userCredentialDto);
  }

  @Post('/authTest')
  @UseGuards(AuthGuard())
  public test(@GetUser() user: UserEntity)
  {
    console.log(user);
  }
}
