import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { BaseProxyMiddleware } from 'src/core/aop/base.proxy.middleware';

@Injectable()
export class ReverseProxyMiddleware extends BaseProxyMiddleware {
  @Inject() private readonly httpService: HttpService;
  private static apolloConfig;

  constructor() {
    super();
    super.setProxies([
      // http://localhost:3333/proxy/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=测试&bk_length=600
      {
        target: 'https://baike.baidu.com',
        proxyHeaders: ['x-reverse-proxy:BaiduBaike'], // x-reverse-proxy:BaiduBaike
        proxyUrls: ['/proxy'],
        removeProxyUrlWhenProxy: true,
        rateLimit: { ttl: 5, limit: 1 },
      },
      // test：http://localhost:3333/proxy/upload/img/2023-02-15/931a96c3.jpeg
      {
        target: 'http://www.nlc.cn',
        proxyUrls: ['/proxy'],
        proxyHeaders: ['x-reverse-proxy:file-download'],
        removeProxyUrlWhenProxy: true,
        bufferSize: 64 * 1024,
      },
    ]);
  }
}
