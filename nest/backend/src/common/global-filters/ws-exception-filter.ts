import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import {
  WsBadRequestException,
  WsTypeException,
  WsUnknownException,
} from '../custom-exception/ws-exception';
import { SocketWithAuth } from 'src/auth/type';

@Catch()
export class WsCatchAllFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const socket: SocketWithAuth = host.switchToWs().getClient();

    if (exception instanceof BadRequestException) {
      const exceptionData = exception.getResponse();
      const exceptionMessage =
        exceptionData['message'] ?? exceptionData ?? exception.name;

      const wsException = new WsBadRequestException(exceptionMessage);
      socket.emit('exception', wsException.getError());
      return;
    }

    if (exception instanceof WsTypeException) {
      socket.emit('exception', exception.getError());
      return;
    }

    const wsException = new WsUnknownException(exception.message);
    console.log({ error: wsException.getError() });

    socket.emit('exception', { message: 'Internal server error' });
  }
}
