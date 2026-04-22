import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<T, { data: T; error: null; status: number }> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<{ data: T; error: null; status: number }> {
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      map((data) => ({
        data,
        error: null,
        status: response.statusCode,
      })),
    );
  }
}
