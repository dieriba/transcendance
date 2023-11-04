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
} from "./../../../../../shared/socket.event";
import {
  addNewChatroom,
  setOfflineUser,
  setOnlineUser,
  updatePrivateChatroomList,
} from "./chatSlice";
import { getSocket } from "../../../utils/getSocket";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendPrivateMessage: builder.mutation<
      SocketServerSucessResponse,
      MessageFormType
    >({
      queryFn: (data) => {
        const socket = getSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventPrivateRoom.SEND_PRIVATE_MESSAGE, data);

          socket.on("exception", (error) => {
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
      async onCacheEntryAdded(
        _arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const socket = getSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            GeneralEvent.USER_LOGGED_OUT,
            (data: SocketServerSucessResponse & { id: string }) => {
              dispatch(setOfflineUser(data.id));
            }
          );

          socket.on(
            GeneralEvent.USER_LOGGED_IN,
            (data: SocketServerSucessResponse & { id: string }) => {
              dispatch(setOnlineUser(data.id));
            }
          );

          socket.on(
            ChatEventPrivateRoom.NEW_CHATROOM,
            (
              data: SocketServerSucessResponse & { data: PrivateChatroomType }
            ) => {
              dispatch(addNewChatroom(data.data));
            }
          );

          socket.on(
            ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE,
            (data: SocketServerSucessResponse & { data: MessageType }) => {
              dispatch(updatePrivateChatroomList(data.data));
            }
          );
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
        socket.off(ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE);
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllPrivateChatroomsQuery, useSendPrivateMessageMutation } =
  chatApiSlice;
