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

import { connectSocket, socket } from "../../../utils/getSocket";
import { BaseChatroomTypeId } from "../../../models/groupChat";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendPrivateMessage: builder.mutation<
      SocketServerSucessResponse,
      MessageFormType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventPrivateRoom.SEND_PRIVATE_MESSAGE, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
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
} = chatApiSlice;
