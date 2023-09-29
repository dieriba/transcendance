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

@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refresh_token = this.extractTokenFromHeader(request);
    if (!refresh_token)
      throw new CustomException(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);

    try {
      const payload = await this.jwtTokenService.checkToken(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
      );

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = { ...payload, refresh_token };
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
