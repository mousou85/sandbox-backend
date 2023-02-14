import {PickType} from '@nestjs/swagger';
import {LoginSuccessDto} from '@app/auth/dto/login.dto';

export class ReissueTokenDto extends PickType(LoginSuccessDto, ['accessToken'] as const) {}
