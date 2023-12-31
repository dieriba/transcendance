import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthPayloadRefresh, RequestWithAuthRefresh } from 'src/auth/type';

export const GetUser = createParamDecorator(
  (key: keyof AuthPayloadRefresh | undefined, context: ExecutionContext) => {
    const request: RequestWithAuthRefresh = context.switchToHttp().getRequest();

    if (!key)
      return {
        userId: request.userId,
        refresh_token: request.refresh_token,
      };
    return request[key];
  },
);
