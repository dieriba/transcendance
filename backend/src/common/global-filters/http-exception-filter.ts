import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Response, Request } from 'express';
import { INTERNAL_SERVER_ERROR } from '../constant/http-error.constant';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.log('Excepetion catched in HttpExceptionFilter');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception?.message
        : INTERNAL_SERVER_ERROR;

    response.status(status).json({
      status,
      message: message,
      path: request.url,
    });
  }
}
