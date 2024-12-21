import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseError } from './exceptions';

@Catch(BaseError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.statusCode;

    response.status(status).json({
      message: exception.message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
