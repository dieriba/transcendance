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

import { socket } from "../../../utils/getSocket";
import { BaseChatroomTypeId } from "../../../models/groupChat";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendPrivateMessage: builder.mutation<
      SocketServerSucessResponse,
      MessageFormType
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          if (!socket) return;

          socket.emit(ChatEventPrivateRoom.SEND_PRIVATE_MESSAGE, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            socket.off(GeneralEvent.EXCEPTION);
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
