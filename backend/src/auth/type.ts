import { Socket } from 'socket.io';
import { Request } from 'express';

export type AuthPayload = {
  userId: string;
  email: string;
  nickname: string;
};

export type Refresh = {
  refresh_token: string;
};

export type AuthPayloadRefresh = AuthPayload & Refresh;
export type RequestWithAuth = Request & AuthPayload;
export type RequestWithAuthRefresh = Request & AuthPayload & Refresh;
export type SocketWithAuth = Socket & AuthPayload;
