import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_JWT_PUBLIC_KEY } from '../../../core/decorators/public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (this.getRequest(context).url.includes('/audit')) {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_JWT_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requestBody = JSON.stringify(this.getRequest(context).body);
    this.logger.info(
      `[${this.constructor.name}] [${context.getType()}] ${
        this.getRequest(context).url
      } isPublic:${isPublic} RequestBody:${
        requestBody.includes('password') ? '' : requestBody
      }`,
    );
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    const isGraphql = String(context.getType()) === 'graphql';

    if (isGraphql) {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }
}
