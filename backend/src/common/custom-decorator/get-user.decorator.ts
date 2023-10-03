import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthPayloadRefresh, RequestWithAuthRefresh } from 'src/auth/type';

export const GetUser = createParamDecorator(
  (key: keyof AuthPayloadRefresh | undefined, context: ExecutionContext) => {
    const request: RequestWithAuthRefresh = context.switchToHttp().getRequest();

    if (!key)
      return {
        id: request.userId,
        nickname: request.nickname,
        email: request.email,
        refresh_token: request.refresh_token,
      };
    return request[key];
  },
);
