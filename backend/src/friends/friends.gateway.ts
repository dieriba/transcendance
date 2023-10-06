import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
@WebSocketGateway({
  namespace: 'friends',
})
export class FriendsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(FriendsGateway.name);

  @WebSocketServer()
  server: Namespace;

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    console.log(client);
    console.log(payload);

    return 'salut mec';
  }
  afterInit(client: Socket) {
    this.logger.log(client);
  }
  handleConnection(client: Socket) {
    const sockets = this.server.sockets;

    this.logger.log(`WS client with id: ${client.id} connected!`);
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);

    this.server.emit('greetings', `Hello from: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const sockets = this.server.sockets;

    this.logger.log(`WS client with id: ${client.id} disconnected!`);
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }
}
