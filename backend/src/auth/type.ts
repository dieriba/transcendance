import { Socket } from 'socket.io';
import { Request } from 'express';

type AuthPayload = {
  userId: string;
  email: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
