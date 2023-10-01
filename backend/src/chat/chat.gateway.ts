import { UseFilters, UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WsGuard } from '../common/guards/ws.guard';
import { SocketAuthMiddleware } from './middleware/ws.socket';
import { WebsocketExceptionsFilter } from 'src/common/global-filters/ws-exception-filter';

@UseGuards(WsGuard)
@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway(parseInt(process.env.WS_PORT), { cors: '*' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  async afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    return 'salut mec';
  }
}
