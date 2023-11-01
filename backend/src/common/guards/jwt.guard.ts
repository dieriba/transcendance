import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import { JwtPayload } from 'src/jwt-token/jwt.type';
import { RequestWithAuth } from 'src/auth/type';
import { CustomException } from '../custom-exception/custom-exception';
import { UNAUTHORIZED } from '../constant/http-error.constant';

@Injectable()
export class JwtAccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly reflector: Reflector,
  ) {}
  private readonly logger = new Logger(JwtAccessTokenGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request: RequestWithAuth = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload: JwtPayload = await this.jwtTokenService.checkToken(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      );
      request.userId = payload.sub;
      request.email = request.email;

      return true;
    } catch (error) {
      throw new CustomException(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
