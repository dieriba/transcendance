import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.log('Excepetion catched in HttpExceptionFilter');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = exception.getStatus();

    if (typeof exception.getResponse() === 'string') {
      response.status(statusCode).json({
        statusCode,
        error: exception.getResponse(),
        path: request.url,
      });
    } else {
      response.status(statusCode).json(exception.getResponse());
    }
  }
}
