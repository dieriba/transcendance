import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CustomException } from '../custom-exception/custom-exception';
import { UNAUTHORIZED } from '../constant/http-error.constant';
import { JwtPayload } from 'src/jwt-token/jwt.type';
import { RequestWithAuthRefresh } from 'src/auth/type';
import { Request } from 'express';
@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithAuthRefresh = context.switchToHttp().getRequest();
    const refresh_token =
      request.cookies['refresh'] || this.extractTokenFromHeader(request);
    if (!refresh_token)
      throw new CustomException(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);

    try {
      const payload: JwtPayload = await this.jwtTokenService.checkToken(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
      );

      request.userId = payload.userId;
      request.refresh_token = refresh_token;
      return true;
    } catch {
      throw new CustomException(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
