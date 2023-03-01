import {PickType} from '@nestjs/swagger';

import {LoginSuccessDto} from '@app/auth/dto';

export class ReissueTokenDto extends PickType(LoginSuccessDto, ['accessToken'] as const) {}
