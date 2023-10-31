import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithAuth } from 'src/auth/type';
import { JwtPayload } from 'src/jwt-token/jwt.type';
import { JwtTokenService } from 'src/jwt-token/jwtToken.service';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    port = parseInt(process.env.WS_PORT);

    const cors = {
      origin: '*',
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(JwtTokenService);
    const server: Server = super.createIOServer(port, optionsWithCORS);

    server.of('chats').use(createTokenMiddleware(jwtService, this.logger));
    server.of('friends').use(createTokenMiddleware(jwtService, this.logger));
    return server;
  }
}
const createTokenMiddleware =
  (jwtService: JwtTokenService, logger: Logger) =>
  async (socket: SocketWithAuth, next) => {
    // for Postman testing support, fallback to token header
    const token: string =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating auth token before connection: ${token}`);

    try {
      const payload: JwtPayload = await jwtService.checkToken(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      );
      socket.userId = payload.sub;
      socket.email = payload.email;
      next();
    } catch (error) {
      console.log({ error });

      next(new WsException('Unauthorized'));
    }
  };
