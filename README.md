# SANDBOX BACKEND 
[sandbox 앱](https://github.com/mousou85/sandbox)에서 백엔드 api만 분리하여 nest.js로 구현한 코드

# 설치
```shell
# 개발 환경
$ npm i

# 프로덕션 환경
$ npm i --production
```

# 실행
```shell
# 개발 환경
$ npm run start:dev

# 프로덕션 환경
# 빌드/실행 같이 진행하는 방법
$ npm run start

# 빌드/실행 나눠서 진행하는 방법
$ npm run build
$ npm run start:prod
```

# environment
`.env.sample`파일명을 `.env`로 수정 후 필요한 정보 입력 
```shell
$ mv .env.sample .env
```
```dotenv
#.env 내용

#사용할 포트
PORT=#기본값: 3000

# mysql/mariadb 정보
DB_HOST=#기본값: localhost
DB_PORT=#기본값: 3306
DB_DATABASE=
DB_USER=
DB_PASSWORD=

# jwt 설정
LOGIN_ACCESS_TOKEN_SECRET=#액세스 토큰 secret
LOGIN_REFRESH_TOKEN_SECRET=#리프레시 토큰 secret

# 로깅 설정
LOGGER_CONSOLE_LEVEL=#로깅할 로그 레벨(silly|debug|verbose|info|warn|error). 기본값: error
LOGGER_FILE_ENABLE=#로그 파일 생성 여부(true|false). 기본값: false
LOGGER_FILE_PATH=#로그 파일 생성 경로
LOGGER_DB=#DB 쿼리 로깅 여부(true|false). 기본값: false
```

# API 문서
개발 환경(`npm run start:dev`)으로 실행 후 `http://localhost:3000/api-doc` 에서 확인 