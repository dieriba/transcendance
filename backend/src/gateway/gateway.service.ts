import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface IGatewaySessionManager {
  getUserSocket(id: string): Socket;
  setUserSocket(id: string, socket: Socket): void;
  removeUserSocket(id: string): void;
  getSockets(): Map<string, Socket>;
}
@Injectable()
export class GatewayService implements IGatewaySessionManager {
  private readonly sessions: Map<string, Socket> = new Map();

  getUserSocket(id: string) {
    return this.sessions.get(id);
  }

  setUserSocket(userId: string, socket: Socket) {
    this.sessions.set(userId, socket);
  }
  removeUserSocket(userId: string) {
    this.sessions.delete(userId);
  }
  getSockets(): Map<string, Socket> {
    return this.sessions;
  }
}
