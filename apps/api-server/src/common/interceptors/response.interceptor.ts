import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
        path: url,
        method,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}