import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { RequestWithAuth } from 'src/auth/type';

@Injectable()
export class PassUserDataToBody implements NestInterceptor {
  readonly logger = new Logger(PassUserDataToBody.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: RequestWithAuth = context.switchToHttp().getRequest();
    const { userId, nickname } = request;

    request.body.userId = userId;
    request.body.nickname = nickname;

    return next.handle();
  }
}
