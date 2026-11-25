import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    return next.handle().pipe(
      map((data: unknown) => {
        if (data === undefined || data === null) return { data };
        if (
          typeof data === 'object' &&
          data !== null &&
          'meta' in data &&
          'data' in data
        )
          return data;
        const response = context.switchToHttp().getResponse<Response>();
        if (response.statusCode === 204) return data;
        return { data };
      }),
    );
  }
}
