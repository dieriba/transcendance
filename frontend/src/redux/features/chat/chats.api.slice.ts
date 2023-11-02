import { PrivateChatroomType } from "./../../../models/ChatContactSchema";
import { SocketServerSucessResponse } from "../../../services/type";
import { getChatsSocket, getFriendsSocket } from "../../../utils/getScoket";
import { apiSlice } from "../../api/apiSlice";
import { FriendEvent } from "@shared/socket.event";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useGetAllPrivateChatroomsQuery } = chatApiSlice;
