import {
  MessageFormType,
  MessageType,
  PrivateChatroomType,
} from "./../../../models/ChatContactSchema";
import {
  BaseServerResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { getChatsSocket, getFriendsSocket } from "../../../utils/getScoket";
import { apiSlice } from "../../api/apiSlice";
import {
  ChatEventPrivateRoom,
  FriendEvent,
} from "./../../../../../shared/socket.event";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendPrivateMessage: builder.mutation<
      SocketServerSucessResponse,
      MessageFormType
    >({
      queryFn: (data) => {
        const socket = getChatsSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventPrivateRoom.SEND_PRIVATE_MESSAGE, data);

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getCurrentChatMessage: builder.query<
      BaseServerResponse & { data: MessageType[] },
      string
    >({
      query: (chatroomId) => ({
        url: `chat/get-all-chatroom-message?chatroomId=${chatroomId}`,
      }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const socket = getChatsSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE,
            (data: SocketServerSucessResponse & { data: MessageType }) => {
              updateCachedData((draft) => {
                draft.data.push(data.data);
              });
            }
          );
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
        socket.off(ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE);
      },
    }),
    getAllPrivateChatrooms: builder.query<
      SocketServerSucessResponse & { data: PrivateChatroomType[] },
      void
    >({
      query: () => ({ url: "chat/get-all-private-chatroom" }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const socket = getFriendsSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            FriendEvent.NEW_CHATROOM,
            (
              data: SocketServerSucessResponse & { data: PrivateChatroomType }
            ) => {
              updateCachedData((draft) => {
                draft.data.push(data.data);
              });
            }
          );

          socket.on(
            ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE,
            (message: MessageType) => {
              updateCachedData((draft) => {
                const chatroom = draft.data.find(
                  (chatroom) => chatroom.id === message.chatroomId
                );
                if (chatroom) {
                  chatroom.messages[0] = message;
                }
              });
            }
          );
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
        socket.off(FriendEvent.NEW_CHATROOM);
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllPrivateChatroomsQuery,
  useGetCurrentChatMessageQuery,
  useSendPrivateMessageMutation,
} = chatApiSlice;
