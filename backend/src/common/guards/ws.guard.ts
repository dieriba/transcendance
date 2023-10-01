import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'ws') return true;

    const client: Socket = context.switchToWs().getClient();

    WsGuard.validateToken(client);
    return true;
  }

  static async validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    console.log({ authorization });
    console.log({ client: client.handshake.auth });

    if (authorization === undefined) throw new Error('Not Authorized');

    const token = authorization.split(' ')[1];
    console.log(token);

    try {
      const paylod = verify(token, process.env.ACCESS_TOKEN_SECRET);
      return paylod;
    } catch (error) {
      throw new WsException('Not Authorized');
    }
  }
}
