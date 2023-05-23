import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class BaseInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    protected reflector: Reflector,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle();
  }

  getRequest(context: ExecutionContext) {
    const isGraphql = String(context.getType()) === 'graphql';

    if (isGraphql) {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  protected log(loggerName, startTime, endTime, context, request, response) {
    const timeCost = `${endTime - startTime}ms`;
    const requestBody =
      request && request.body ? `Request:${JSON.stringify(request.body)}` : '';
    response = `Response:${JSON.stringify(response)}`;
    this.logger.info(
      `[${loggerName}] [${timeCost}] [${context.getType()}] ${
        request.method
      } BaseURL:${request.baseUrl} URL:${request.url} Headers:${JSON.stringify(
        request.headers,
      )} ${requestBody.includes('password') ? '' : requestBody} ${response}`,
    );
  }
}
