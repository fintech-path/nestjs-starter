<p align="center"><a href="https://docs.nestjs.com/">Nestjs</a> is a progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

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
  - Enable auto format on save: 文件 > 首选项 > 配置 > 搜索 format 并设置 auto save

## Init project (only run once) 初始化工程，只需运行一次

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

- ```pnpm start``` 会调用 pm2 命令启动一个两个节点的 cluster: ```npx pm2 start 'pnpm run prod' --name nestjs-starter -i 2 --watch```

## 环境变量

- 根目录下的 .env.dev.json 和 .env.prod.json 文件。
- 环境切换: 见 package.json 中 dev 和 start 命令，使用 env-cmd -f .env.prod.json 来指定哪个环境文件生效。

## RESTful

- 参考 src/modules/restful
- Swagger api doc:

  - 配置: main.ts 中的 createSwaggerIfNotProdEnv(app) 函数。
  - 访问：[http://localhost:3333/swagger](http://localhost:3333/swagger), [http://localhost:3333/swagger-json](http://localhost:3333/swagger-json)

## GraphQL

- 相关代码位置: src/modules/graphql
- 配置: src/modules/graphql/graphql.module.ts
- Playground: <http://localhost:3333/graphql>
- 修改了 .graphql (schema) 文件后，运行以下命令重新生成 graphql 代码。（*.graphql 文件可以放在 src 目录下的任何地方，会自动扫描。）

```bash
   # 执行脚本文件：src/modules/graphql/gen.graphql.typings
   pnpm run gen-gql
```

- 自动生成的 graphql 代码位置：src/modules/graphql/schema/auto.generated.graphql.schema.ts

## Database ORM: Prisma

代码位置：src/common/database

- 运行以下命令会自动生成数据库代码到： node_modules/@prisma/client

```bash
  # dev
  $ pnpm run gen-prisma:dev
  # prod
  $ pnpm gen-prisma:prod
```

- 打开 prisma studio

```bash
  # dev
  $ pnpm run prisma-studio:dev
  # prod
  $ pnpm run prisma-studio:prod
```

- 使用方法参考 src/common/auth/services/user.service.ts 下的代码
  - user.modules.ts 中声明了 PrismaService
  - user.service.ts 注入并使用了 PrismaService

- Database
  - Using: sqlite 本地文件数据库。
  - Database file: src/common/database/sqlite.db
  - 连接串环境变量：根目录下 .evn.dev.json, .env.prod.json 中的 ```"DATABASE_URL": "file:./sqlite.db"```

## Serve static

- 静态文件部署目录: src/static.
- 配置：src/app.module.ts 中的 ServeStaticModule

**vue-client**

- vue-client 目录是一个 vue 项目写的简单客户端，需要用 vscode 单独打开此目录进行开发。主要是为了测试 graphql 的订阅功能。在其目录下运行 npm run build 会自动将静态文件部署到 nestjs 项目的 src/static 目录。

## JWT(Json Web Token)

- JWT auth guard 全局生效，所有 restful 和 graphql 接口没有 token 都无法访问。
- 全局配置: src/app.module.ts

```javascript
  // src/app.module.ts
  providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

- RESTful 登录入口：api/auth/token (src/modules/restful/auth/auth.controller.ts) POST 传入 username: admin, password: admin
- GraphQL 用如下 mutation 登录：localhost:3333/graphql (src/modules/graphql/auth/gql.auth.resolver.ts)

```graphql
  mutation {
      token(username: "admin", password: "admin")
  }
```

- 如果想让某个接口可以被公共访问，加上 @Public() 装饰器。@Public() 是自定义装饰器：src/common/auth/public.decorator.ts
- src/common/auth/guards/jwt.auth.guard.ts 中处理了 @Public() 装饰器
- src/common/auth/strategies/local.strategy.ts 中处理了登录

## 反向代理

- 代码位置: src/modules/proxy
- 参考 src/modules/proxy/reverse.proxy.middleware.ts 创建代理（继承父类方式），并注册到 src/modules/proxy/reverse.proxy.module.ts 中
- 测试链接（代理百度百科）: <http://localhost:3333/proxy/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=测试&bk_length=600>
- **注意反向代理的限流是单独实现的。**
- 反向代理支持的功能：基于 header 和路由转发；限流；文件上传；gzip

## 日志

- 日志库：nest-winston
- 配置：
  - src/app.module.ts (WinstonModule.forRoot(createAppLoggerOptions()))
  - src/common/log/app.logger.options.ts
  - 文件日志记录到项目根目录下的 app.log 文件中
- 使用：注入 ```@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;```
- 全局异常日志记录：src/common/aop/global.exception.filter.ts
- 全局 restful, graphql 日志记录：src/common/aop/http.interceptor.ts

## 限流

- 库: @nestjs/throttler
- 配置: src/modules/restful/openapi/openapi.modules.ts

```javascript
ThrottlerModule.forRoot({
      ttl: 2,
      limit: 1,
    }),
```

- 使用: 参考 src/modules/restful/openapi/openapi.controller.ts 中的 @UseGuards(ThrottlerGuard) 和 @Throttle()

- **注意：反向代理中的限流是单独实现的，因为 throttler 的设置对 middleware 不生效。参考：src/modules/proxy/reverse.proxy.middleware.ts**

## 监控

- 配置: src/modules/restful/monitor
- Terminus: <http://localhost:3333/audit/health>
- Prometheus: <http://localhost:3333/audit/metrics>

## HTTPS

> Based on the NestJS documentation, the httpsOptions object passed to NestFactory.create() can include a key property, which is used to specify the private key file for SSL / TLS encryption.However, this property is optional, and if it is not provided, the server will use a self- signed certificate by default.
>
> 注意 key.pem 和 cert.pem 两个文件只是例子，实际开发需要替换成真正内容。

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