import { Socket } from 'socket.io';
import { Request } from 'express';
import { Profile } from '@prisma/client';

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
export type ResponseLoginType = {
  id: string;
  nickname: string;
  twoFa: boolean;
  profile: Partial<Profile>;
  allowForeignToDm: boolean;
  oauth: boolean;
};

export type UserToken = { id: string; twoFa: boolean };
