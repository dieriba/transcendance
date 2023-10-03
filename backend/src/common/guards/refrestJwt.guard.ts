import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomException } from '../custom-exception/custom-exception';
import { UNAUTHORIZED } from '../constant/constant';
import { JwtPayload } from 'src/jwt-token/jwt.type';
import { RequestWithAuthRefresh } from 'src/auth/type';

@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithAuthRefresh = context.switchToHttp().getRequest();
    const refresh_token = this.extractTokenFromHeader(request);
    if (!refresh_token)
      throw new CustomException(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);

    try {
      const payload: JwtPayload = await this.jwtTokenService.checkToken(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
      );

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.userId = payload.sub;
      request.nickname = payload.nickname;
      request.email = request.email;
      request.refresh_token = refresh_token;
    } catch {
      throw new CustomException(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
