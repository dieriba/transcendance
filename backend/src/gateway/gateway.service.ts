import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface IGatewaySessionManager {
  getAllUserSocket(id: string): Set<Socket> | undefined;
  setUserSocket(id: string, socket: Socket): void;
  removeUserSocket(userId: string, socket: Socket): void;
  getSockets(): Map<string, Set<Socket>>;
}
@Injectable()
export class GatewayService implements IGatewaySessionManager {
  private readonly sessions: Map<string, Set<Socket>> = new Map<
    string,
    Set<Socket>
  >();

  getAllUserSocket(userId: string): Set<Socket> | undefined {
    if (!this.sessions.has(userId)) return undefined;

    return this.sessions.get(userId);
  }

  setUserSocket(userId: string, socket: Socket) {
    if (userId) {
      if (!this.sessions.has(userId)) {
        this.sessions.set(userId, new Set());
      }

      this.sessions.get(userId).add(socket);
    }
  }

  removeUserSocket(userId: string, socket: Socket) {
    if (this.sessions.has(userId)) {
      this.sessions.get(userId).delete(socket);

      if (this.sessions.get(userId).size === 0) {
        this.sessions.delete(userId);
      }
    }
  }

  getSockets(): Map<string, Set<Socket>> {
    return this.sessions;
  }
}
