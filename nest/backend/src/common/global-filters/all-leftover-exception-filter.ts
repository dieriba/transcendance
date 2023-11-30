import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Response, Request } from 'express';
import { INTERNAL_SERVER_ERROR } from '../constant/http-error.constant';

@Catch()
export class allLeftOverExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(allLeftOverExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    this.logger.log('Excepetion catched in allLeftOverException');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.log({ exception });
    const message =
      exception instanceof Error ? exception?.message : INTERNAL_SERVER_ERROR;

    response.status(status).json({
      status,
      message: message,
      path: request.url,
    });
  }
}
