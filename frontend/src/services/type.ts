import { BaseFriendType } from "../models/FriendsSchema";

export type ServerError = {
  error: string;
  message: string;
  statusCode: number;
};

export type BaseServerResponse = {
  message: string;
  statusCode: number;
};

export type SocketServerErrorResponse = {
  message: string;
  type: string;
};

export type SocketServerSucessResponse = {
  message: string;
  data: unknown;
};

export type BaseFriendTypeWithChatroom = BaseFriendType & {
  chatroomId?: string;
};
