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
};

export type BaseFriendTypeWithChatroom = BaseFriendType & {
  chatroomId?: string;
};

export type SocketServerSucessWithChatroomId = SocketServerSucessResponse & {
  chatroomId: string;
};
