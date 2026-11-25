import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as Record<string, unknown> | string;
      const resObj = typeof res === 'object' && res ? res : { message: res };
      const rawMessage = resObj.message;
      const message = Array.isArray(rawMessage)
        ? String(rawMessage[0])
        : typeof rawMessage === 'string'
          ? rawMessage
          : exception.message;
      const errors = Array.isArray(rawMessage)
        ? rawMessage.map(String)
        : undefined;
      response.status(status).json({
        statusCode: status,
        message,
        ...(errors ? { errors } : {}),
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Terjadi kesalahan pada server',
    });
  }
}
