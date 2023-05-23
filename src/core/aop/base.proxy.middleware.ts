import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { PassThrough } from 'stream';
import * as zlib from 'zlib';
import { RequestHandler } from 'express';
import { JsonUtils } from 'src/core/utils/json';

export interface ReverseProxyOptions {
  id?: string;
  target: string;
  proxyHeaders?: string[];
  proxyUrls?: string[];
  removeProxyUrlWhenProxy?: boolean;
  extraHeaders?: string[]; //例：['headerkey1:headervalue1', 'headerkey2:headervalue2']
  rateLimit?: ReverseProxyRateLimitOptions;
  ssl?: boolean;
  timeout?: number;
  bufferSize?: number;
  logRequest?: boolean;
  logResponse?: boolean;
  excludeApis?: string[];
  secure?: boolean;
}

const DEFAULT_TIMEOUT: number = 10 * 1000;
const DEFAULT_BUFFER: number = 16 * 1024;

export interface ReverseProxyRateLimitOptions {
  ttl: number;
  limit: number;
}

interface Proxy {
  middleware: RequestHandler;
  limiter: RateLimitRequestHandler;
  options: ReverseProxyOptions;
}

@Injectable()
export class BaseProxyMiddleware implements NestMiddleware {
  private static proxies: Proxy[];
  @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger;

  public setProxies(options: ReverseProxyOptions[]) {
    if (!options || options.length <= 0) {
      return;
    }
    BaseProxyMiddleware.proxies = [];
    for (const opt of options) {
      if (!opt.proxyHeaders && !opt.proxyUrls) {
        continue;
      }
      BaseProxyMiddleware.proxies.push({
        middleware: this.createProxyMiddleware(opt),
        limiter: opt.rateLimit ? this.createRateLimter(opt) : null,
        options: opt,
      });
    }
  }

  use(req: any, res: any, next: () => void) {
    (req as any).startTime = new Date().getTime();
    if (
      !BaseProxyMiddleware.proxies ||
      BaseProxyMiddleware.proxies.length <= 0
    ) {
      next();
      return;
    }
    for (const proxy of BaseProxyMiddleware.proxies) {
      if (!this.isProxyMatching(proxy, req)) {
        continue;
      }
      if (
        proxy.options.excludeApis &&
        proxy.options.excludeApis.some((api) => req.originalUrl === api)
      ) {
        this.logger.info(
          `[${this.constructor.name}] skip ${req.originalUrl} because it is in exclude list.`,
        );
        continue;
      }
      this.addExtraHeaders(req, proxy.options);
      if (proxy.limiter) {
        proxy.limiter(req, res, () => {
          proxy.middleware(req, res, next);
        });
      } else {
        proxy.middleware(req, res, next);
      }
      return;
    }
    next();
  }

  private isProxyMatching(proxy, req) {
    const isMatchUrl = this.isMatchProxyUrls(proxy, req);
    const isMatchHeader = this.isMatchProxyHeaders(proxy, req);
    if (
      proxy.options.proxyUrls &&
      proxy.options.proxyUrls.length > 0 &&
      proxy.options.proxyHeaders &&
      proxy.options.proxyHeaders.length > 0
    ) {
      return isMatchUrl && isMatchHeader;
    }
    return isMatchUrl || isMatchHeader;
  }

  private isMatchProxyUrls(proxy, req) {
    if (!proxy.options.proxyUrls || proxy.options.proxyUrls.length <= 0) {
      return false;
    }
    for (const url of proxy.options.proxyUrls) {
      if (req.originalUrl.startsWith(url)) {
        this.logger.info(
          `[${this.constructor.name}]: URL prefix matchs proxy url:${proxy.options.proxyUrl} originalUrl:${req.originalUrl}`,
        );
        return true;
      }
    }
    return false;
  }

  private isMatchProxyHeaders(proxy, req) {
    for (const temp of proxy.options.proxyHeaders) {
      const proxyHeader = temp.split(':');
      const headerKey = proxyHeader[0].trim();
      const headerValue = proxyHeader[1].trim();
      if (req.headers[headerKey.toLowerCase()] === headerValue) {
        this.logger.info(
          `[${this.constructor.name}]: Request header matchs: ${headerKey}:${headerValue} > ${proxy.options.target}`,
        );
        return true;
      }
    }
    return false;
  }

  private createProxyMiddleware(opt: ReverseProxyOptions) {
    return createProxyMiddleware({
      target: opt.target,
      changeOrigin: true,
      secure: opt.secure,
      ssl: opt.ssl,
      buffer: new PassThrough({
        highWaterMark: opt.bufferSize ?? DEFAULT_BUFFER,
      }),
      timeout: opt.timeout ?? DEFAULT_TIMEOUT,
      proxyTimeout: opt.timeout ?? DEFAULT_TIMEOUT,
      onError: (e, req, res, target) => {
        this.logErrorAndReturn500(e, req, res, target);
      },
      pathRewrite: (path) => {
        if (!opt.removeProxyUrlWhenProxy) {
          return path;
        }
        for (const proxyUrl of opt.proxyUrls) {
          path = path.replace(proxyUrl, '');
        }
        return path;
      },
      onProxyReq: (proxyReq, req, res, options) => {
        this.addExtraHeaders(req, opt);
        this.logRequestInfo(req, opt);
        this.handleRequestBodyBeforeSend(proxyReq, req, res);
      },
      onProxyRes: (proxyRes, req, res) => {
        this.logResponseAndHandleGzipData(proxyRes, req, opt);
      },
    });
  }

  private addExtraHeaders(req, opt) {
    if (opt.extraHeaders) {
      for (const header of opt.extraHeaders) {
        const index = header.indexOf(':');
        const key = header.slice(0, index); // "host"
        const value = header.slice(index + 1);
        req.headers[key.trim().toLowerCase()] = value.trim();
      }
    }
  }

  private createRateLimter(options) {
    return rateLimit({
      standardHeaders: true,
      windowMs: options.rateLimit.ttl * 1000,
      max: options.rateLimit.limit, // limit each IP requests per windowMs
      handler: function (req, res) {
        res.status(429).json({
          statusCode: 429,
          message: 'Too many requests, please try again later.',
        });
      },
    });
  }

  private handleRequestBodyBeforeSend(proxyReq, req, res) {
    if (String(req.method).toLowerCase() === 'get' || !req.body) {
      proxyReq.end();
      return;
    }

    if (String(req.headers['content-type']).toLowerCase().includes('json')) {
      const body = JsonUtils.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
      proxyReq.write(body);
      proxyReq.end();
    } else if (
      String(req.headers['content-type'])
        .toLowerCase()
        .includes('x-www-form-urlencoded')
    ) {
      proxyReq.setHeader('content-length', Buffer.byteLength(req.rawBody));
      proxyReq.write(req.rawBody);
      proxyReq.end();
    } else if (
      String(req.headers['content-type'])
        .toLowerCase()
        .includes('multipart/form-data')
    ) {
      let buffer = Buffer.alloc(0);
      req.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
      });
      req.on('end', () => {
        proxyReq.setHeader('content-length', buffer.length);
        proxyReq.write(buffer);
        proxyReq.end();
      });
    } else {
      proxyReq.end();
    }
  }

  private logErrorAndReturn500(e, req, res, target) {
    this.logger.error(
      `[${
        this.constructor.name
      }] Proxy onError: target:${target}, error:${JsonUtils.stringify(e)}`,
    );
    if (res.headersSent) {
      return;
    }
    this.logger.error(
      `[${this.constructor.name}] Proxy onError: headerSent:${
        res.headerSent
      }, statusCode:500, target:${target}, error:${JsonUtils.stringify(e)}`,
    );
    // custom error handler
    res.status(500).json({
      statusCode: 500,
      message: JsonUtils.stringify(e),
    });
  }

  private logResponseAndHandleGzipData(proxyRes, req, options) {
    if (options.logResponse !== undefined && !options.logResponse) {
      return;
    }
    const timeCost = `time:${new Date().getTime() - req.startTime}ms`;
    if (
      proxyRes.headers['content-length'] &&
      proxyRes.headers['content-length'] > 1024 * 5
    ) {
      this.logger.info(
        `[${this.constructor.name}] Response [${timeCost}]: ${options.target}${req.url} success`,
      );
      return;
    }

    let body = Buffer.alloc(0, 1024, 'utf-8');
    const encoding = proxyRes.headers['content-encoding'];
    const isGzipped = encoding === 'gzip';

    proxyRes.on('data', (chunk) => {
      body = Buffer.concat([body, chunk]);
    });

    const logResponse = () => {
      this.logger.info(
        `[${this.constructor.name}] Response [${timeCost}] [${req.method}] ${
          options.target
        }${
          req.url ?? ''
        } Body: ${body.toLocaleString()}, Response headers: ${JsonUtils.stringify(
          proxyRes.headers,
        )}`,
      );
    };
    proxyRes.on('end', () => {
      if (isGzipped) {
        zlib.gunzip(body, (err, decoded) => {
          if (err) {
            this.logger.error(
              `[${this.constructor.name}] Error decoding gzip response: ${err}`,
            );
            return;
          }
          body = decoded;
          logResponse();
        });
      } else {
        logResponse();
      }
    });
  }

  private logRequestInfo(req, options) {
    if (options.logRequest !== undefined && !options.logRequest) {
      return;
    }
    this.logger.info(
      `[${this.constructor.name}] Request [${req.method}] ${req.headers.host}${
        req.originalUrl
      } -> ${options.target}${req.url}, Request raw body: ${
        req.rawBody
      }, Request body: ${JsonUtils.stringify(
        req.body,
      )}, Request headers: ${JsonUtils.stringify(req.headers)}`,
    );
  }
}
