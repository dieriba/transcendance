import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import { SocketWithAuth } from 'src/auth/type';
import { UNAUTHORIZED } from '../constant/http-error.constant';
import { WsUnauthorizedException } from '../custom-exception/ws-exception';
import { GeneralEvent } from '../../../../shared/socket.event';

@Injectable()
export class WsAccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly reflector: Reflector,
  ) {}
  private readonly logger = new Logger(WsAccessTokenGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const client: SocketWithAuth = context.switchToWs().getClient();

    const token: string =
      client.handshake.auth.token || client.handshake.headers['token'];

    if (!token) throw new WsUnauthorizedException(UNAUTHORIZED);

    try {
      await this.jwtTokenService.checkToken(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      );

      return true;
    } catch (error) {
      console.log({ error });

      client.emit(GeneralEvent.TOKEN_NOT_VALID);

      throw new WsUnauthorizedException(GeneralEvent.TOKEN_NOT_VALID);
    }
  }
}
