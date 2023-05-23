import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { BaseInterceptor } from './base.interceptor';

@Injectable()
export class HttpInterceptor extends BaseInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context instanceof GqlExecutionContext) {
      return next.handle();
    }
    // return next.handle().pipe(tap(data=>console.log('adter...',data)));
    const start = new Date().getTime();
    const request =
      context.switchToHttp().getRequest() || context.getArgByIndex(2).req;

    if (!request) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => {
        this.log(
          HttpInterceptor.name,
          start,
          new Date().getTime(),
          context,
          request,
          data,
        );
        return data;
      }),
    );
  }
}
