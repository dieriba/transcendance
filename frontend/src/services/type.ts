import { AlertColor } from "@mui/material";
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

export type BaseSocketServerResponse = {
  message: string;
  severity?: AlertColor;
};

export type SocketServerErrorResponse = BaseSocketServerResponse & {
  type: string;
};

export type SocketServerSucessResponse = BaseSocketServerResponse;

export type BaseFriendTypeWithChatroom = BaseFriendType & {
  chatroomId?: string;
};

export type SocketServerSucessWithChatroomId = SocketServerSucessResponse & {
  chatroomId: string;
};
