import {
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
@Injectable()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super();
  }

  catch(exception: any, host: ArgumentsHost) {
    if (String(host.getType()) === 'graphql') {
      this.logGraphqlException(exception, host);
    } else {
      super.catch(exception, host);
      this.logException(exception, host);
    }
  }

  private logException(exception: any, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const request = host.switchToHttp().getRequest();
      if (!request) {
        return;
      }
      const requestBody = JSON.stringify(request.body);
      const exceptionJson = JSON.stringify(exception);
      this.logger.info(
        `[${this.constructor.name}] ${request.method} ${request.url} requestBody:${requestBody} ${exceptionJson}`,
      );
      return;
    }
    this.logger.info(`[${this.constructor.name}] ${JSON.stringify(exception)}`);
  }

  private logGraphqlException(exception: any, host: ArgumentsHost) {
    const cache = [];
    this.logger.error(
      exception,
      JSON.stringify(
        host.switchToHttp().getNext().req.body,
        function (key, value) {
          if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
              return;
            }
            cache.push(value);
          }
          return value;
        },
      ),
    );
  }
}
