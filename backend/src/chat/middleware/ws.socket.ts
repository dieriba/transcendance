import { Socket } from 'socket.io';
import { WsGuard } from 'src/common/guards/ws.guard';

export type SocketIoMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIoMiddleware => {
  return (client, next) => {
    try {
      WsGuard.validateToken(client);
      next();
    } catch (error) {
      next(error);
    }
  };
};
