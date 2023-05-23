import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;

  canActivate(context: ExecutionContext) {
    this.logger.info(`[${this.constructor.name}] [${context.getType()}]`);
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
