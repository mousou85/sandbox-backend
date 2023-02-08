import {PickType} from '@nestjs/swagger';
import {LoginSuccessDto} from '@app/auth/dto/loginResponse.dto';

export class ReissueTokenResponseDto extends PickType(LoginSuccessDto, ['accessToken'] as const) {}
