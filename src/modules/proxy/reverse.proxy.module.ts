import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ReverseProxyMiddleware } from './reverse.proxy.middleware';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [ReverseProxyMiddleware],
})
export class ReverseProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ReverseProxyMiddleware).forRoutes('/proxy/');
  }
}
