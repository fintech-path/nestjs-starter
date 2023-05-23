<p align="center"><a href="https://docs.nestjs.com/">Nestjs</a> is a progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

[中文文档](./README_CN.md)

## Description

[Nest](https://github.com/nestjs/nest) starter project and will add all necessary server side features.

## Ref Documentation

- [Node.js](https://www.bookstack.cn/read/SunnySnail-nodejs-book/9cb69271613ce75c.md)
- [nestjs 中文](https://nestjs.bootcss.com/)
- [nestjs English](https://docs.nestjs.com/)
- [typescript](https://www.bookstack.cn/read/DavidCai1993-typescript-handbook/README.md)
- [prisama](https://docs.nestjs.com/recipes/prisma) database ORM

## Installation

- Install [Node.js](https://nodejs.org/en/)
- Install [VSCode](https://code.visualstudio.com/Download)
- Open VSCode and install below VSCode plugins:
  - EditorConfig for VS Code
  - Prettier - Code formatter
  - ESLint
  - Code Spell Checker
  - Git History
  - GitLens — Git supercharged
  - Enable auto format on save

## Init project (only run once)

  ```bash
  # Ali mirror, only for china. Skip it if you don't need it.
  $ npm config set registry https://registry.npmmirror.com/

  # install pnpm, nestjs cli, cross-env
  $ npm i -g pnpm @nestjs/cli cross-env ts-node

  # This project is using pnpm
  $ pnpm install

  ```

- **Tip:** if `pnpm install` error，use `pnpm store path` to find pnpm cache dir，delete it，then run `pnpm install -g`, `pnpm install` again.

- Recommand using [pnpm](https://github.com/pnpm/pnpm)

## Run project

  ```bash
  # run dev
  $ pnpm run dev

  # run production
  $ pnpm start
  ```

## environment variable

- see .env.dev.json and .env.prod.json
- switch env: see command 'dev' and 'start' package.json. use env-cmd -f

## RESTful

- see src/modules/restful
- Swagger api doc:

  - config: createSwaggerIfNotProdEnv(app) in main.ts。
  - visit：[http://localhost:3333/swagger](http://localhost:3333/swagger), [http://localhost:3333/swagger-json](http://localhost:3333/swagger-json)

## GraphQL

- see: src/modules/graphql
- config: src/modules/graphql/graphql.module.ts
- Playground: <http://localhost:3333/graphql>
- After modifying the .graphql (schema) file, run the following command to regenerate the graphql code. (*.graphql files can be placed anywhere in the src directory and will be scanned automatically.)

```bash
   # 执行脚本文件：src/modules/graphql/gen.graphql.typings
   pnpm run gen-gql
```

- Automatically generated graphql code location: src/modules/graphql/schema/auto.generated.graphql.schema.ts

## Database ORM: Prisma

see：src/common/database

- run command to generate prisma codes： node_modules/@prisma/client

```bash
  # dev
  $ pnpm run gen-prisma:dev
  # prod
  $ pnpm gen-prisma:prod
```

- open prisma studio

```bash
  # dev
  $ pnpm run prisma-studio:dev
  # prod
  $ pnpm run prisma-studio:prod
```

- see code to konw how to use: src/common/auth/services/user.service.ts
  - config: user.modules.ts > PrismaService

- Database
  - Using: sqlite local file database。
  - Database file: src/common/database/sqlite.db
  - config: see ```"DATABASE_URL": "file:./sqlite.db"``` in .evn.dev.json, .env.prod.json

## Serve static

- static files serve dir: src/static.
- config：ServeStaticModule in src/app.module.ts

**vue-client**

- The vue-client directory is a simple client written by a vue project, which needs to be opened separately with vscode for development. Mainly to test the subscription function of graphql. Running npm run build in its directory will automatically deploy the static files to the src/static directory of the nestjs project.

## JWT(Json Web Token)

- config: JwtAuthGuard in src/app.module.ts

```javascript
  // src/app.module.ts
  providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

- RESTful login：api/auth/token (src/modules/restful/auth/auth.controller.ts) POST username: admin, password: admin
- GraphQL using below gql to login：localhost:3333/graphql (src/modules/graphql/auth/gql.auth.resolver.ts)

```graphql
  mutation {
      token(username: "admin", password: "admin")
  }
```

- If you want an api to be publicly accessible, add the @Public() decorator. @Public() is a custom decorator: src/common/auth/public.decorator.ts
- @Public() decorator handled in src/common/auth/guards/jwt.auth.guard.ts
- Login is handled in src/common/auth/strategies/local.strategy.ts

## reverse proxy

- Code location: src/modules/proxy
- Refer to src/modules/proxy/reverse.proxy.middleware.ts to create a proxy (inherit the parent class method), and register it in src/modules/proxy/reverse.proxy.module.ts
- Test link (proxy Baidu Encyclopedia): <http://localhost:3333/proxy/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=test&bk_length=600>
- **Note that the current limit of the reverse proxy is implemented separately. **
- Functions supported by reverse proxy: based on header and route forwarding; current limiting; file upload; gzip

## logs

- Log library: nest-winston
- configuration:
   - src/app.module.ts (WinstonModule.forRoot(createAppLoggerOptions()))
   - src/common/log/app.logger.options.ts
   - File logging to the app.log file at the root of the project
- Use: Inject ```@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;```
- Global exception logging: src/common/aop/global.exception.filter.ts
- Global restful, graphql logging: src/common/aop/http.interceptor.ts

## Limiting

- Library: @nestjs/throttler
- Configuration: src/modules/restful/openapi/openapi.modules.ts

```javascript
ThrottlerModule. forRoot({
       ttl: 2,
       limit: 1,
     }),
```

- Use: Refer to @UseGuards(ThrottlerGuard) and @Throttle() in src/modules/restful/openapi/openapi.controller.ts

- **Note: The current limit in the reverse proxy is implemented separately, because the settings of the throttler do not take effect on the middleware. Reference: src/modules/proxy/reverse.proxy.middleware.ts**

## Monitoring

- Configuration: src/modules/restful/monitor
- Terminus: <http://localhost:3333/audit/health>
- Prometheus: <http://localhost:3333/audit/metrics>

## HTTPS

> Based on the NestJS documentation, the httpsOptions object passed to NestFactory.create() can include a key property, which is used to specify the private key file for SSL / TLS encryption. However, this property is optional, and if it is not provided, the server will use a self-signed certificate by default.
>
> Note that the key.pem and cert.pem files are just examples, and should be replaced with real content for actual development.

```javascript
// main.ts

let app;
if (ENV === 'PROD' && HTTPS_ENABLED) {
  app = await NestFactory.create(AppModule, getHttpsOptions());
} else {
  app = await NestFactory.create(AppModule);
}

function getHttpsOptions() {
  return {
    httpsOptions: {
      //key: fs.readFileSync('src/common/security/ssl/key.pem'),
      cert: fs.readFileSync('src/common/security/ssl/cert.pem'),
    },
  };
}
```