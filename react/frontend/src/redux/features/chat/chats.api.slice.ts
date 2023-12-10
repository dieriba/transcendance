import {
  MessageFormType,
  MessageType,
  PrivateChatroomType,
} from "./../../../models/ChatContactSchema";
import {
  BaseServerResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { apiSlice } from "../../api/apiSlice";
import {
  ChatEventPrivateRoom,
  GeneralEvent,
} from "../../../../shared/socket.event";

import { clearSocket, connectSocket, socket } from "../../../utils/getSocket";
import { BaseChatroomTypeId } from "../../../models/groupChat";
import { BaseUserInfoType } from "../../../models/login/UserSchema";
import { Basetype } from "../../../models/BaseType";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPrivateChatroom: builder.mutation<
      SocketServerSucessResponse & { data: PrivateChatroomType },
      Basetype
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventPrivateRoom.CREATE_PRIVATE_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.EXCEPTION, GeneralEvent.SUCCESS]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.EXCEPTION, GeneralEvent.SUCCESS]);
            resolve({ error });
          });
        });
      },
    }),
    sendPrivateMessage: builder.mutation<
      SocketServerSucessResponse,
      MessageFormType
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventPrivateRoom.SEND_PRIVATE_MESSAGE, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.EXCEPTION, GeneralEvent.SUCCESS]);
            resolve({ error });
          });
        });
      },
    }),
    getAllPrivateChatrooms: builder.query<
      BaseServerResponse & { data: PrivateChatroomType[] },
      void
    >({
      query: () => ({ url: "chat/get-all-private-chatroom" }),
    }),
    getAllChatableUser: builder.query<
      BaseServerResponse & { data: BaseUserInfoType[] },
      void
    >({
      query: () => ({ url: "chat/get-all-chatables-users" }),
    }),
    getAllChatroomMessage: builder.query<
      BaseServerResponse & { data: MessageType[] },
      BaseChatroomTypeId
    >({
      query: ({ chatroomId }) => ({
        url: `chat/get-all-chatroom-message?chatroomId=${chatroomId}`,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllPrivateChatroomsQuery,
  useSendPrivateMessageMutation,
  useGetAllChatroomMessageQuery,
  useGetAllChatableUserQuery,
  useCreatePrivateChatroomMutation,
} = chatApiSlice;
