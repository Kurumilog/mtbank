import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const error = typeof payload === 'string' ? payload : extractMessage(payload);

      response.status(status).json({
        data: null,
        error,
        status,
      });

      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      data: null,
      error: 'Internal server error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}

function extractMessage(payload: object) {
  const candidate = payload as { message?: string | string[] };

  if (Array.isArray(candidate.message)) {
    return candidate.message.join(', ');
  }

  return candidate.message ?? 'Request failed';
}
