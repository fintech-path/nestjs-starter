import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtAuthGuard } from './common/auth/guards/jwt.auth.guard';
import { join } from 'path';
import { ReverseProxyModule } from './modules/proxy/reverse.proxy.module';
import { MyGraphQLModule } from './modules/graphql/graphql.module';
import { WinstonModule } from 'nest-winston';
import { HttpInterceptor } from './core/aop/http.interceptor';
import { GlobalExceptionsFilter } from './core/aop/global.exception.filter';
import { createAppLoggerOptions } from './core/log/app.logger.options';
import { RestfulModule } from './modules/restful/restful.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionsFilter,
    },
  ],
  imports: [
    ReverseProxyModule,
    MyGraphQLModule,
    RestfulModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'static'),
      exclude: ['/api*', '/graphql', '/proxy*', '/audit*'],
      // serveStaticOptions: {
      //   extensions: ['js', 'css'], // enable JavaScript files
      // },
    }),
    WinstonModule.forRoot(createAppLoggerOptions()),
  ],
})
export class AppModule {}
