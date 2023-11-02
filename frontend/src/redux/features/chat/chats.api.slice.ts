import { PrivateChatroomType } from "./../../../models/ChatContactSchema";
import {
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { getChatsSocket, getFriendsSocket } from "../../../utils/getScoket";
import { apiSlice } from "../../api/apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPrivateChatrooms: builder.query<
      | (SocketServerSucessResponse & { data: PrivateChatroomType[] })
      | SocketServerErrorResponse,
      void
    >({
      query: () => ({ url: "chat/get-all-private-chatroom" }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const socket = getChatsSocket();
        try {
          await cacheDataLoaded;

          
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllPrivateChatroomsQuery } = chatApiSlice;
