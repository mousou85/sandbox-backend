import {AuthModule} from '@app/auth/auth.module';
import {InvestModule} from '@app/invest/invest.module';
import {UserModule} from '@app/user/user.module';

export const swaggerConfig = () => [
  {
    title: 'sandbox api - 공통',
    description: 'sandbox 공통 api',
    version: '0.1',
    urlPrefix: 'api-doc',
    includeModules: [AuthModule, UserModule, InvestModule],
  },
];
