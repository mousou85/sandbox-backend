import {AuthModule} from '@app/auth/auth.module';

export const swaggerConfig = [
  {
    title: 'sandbox api - 공통',
    description: 'sandbox 공통 api',
    version: '0.1',
    urlPrefix: 'api-doc/common',
    includeModules: [AuthModule],
  },
];
