import { FriendRequestType } from "../../../models/FriendRequestSchema";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { BaseServerResponse } from "../../../services/type";
import { getFriendsSocket } from "../../../utils/getScoket";
import { apiSlice } from "../../api/apiSlice";
import { FriendEvent } from "./friends.slice";

export const friendsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendFriendRequest: builder.mutation<string | object, FriendRequestType>({
      queryFn: (data) => {
        const socket = getFriendsSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.FRIEND_REQUEST_SENT, data, (data: string) => {
            resolve({ data });
          });
          socket.on("exception", (error) => {
            return resolve({ error });
          });
        });
      },
    }),
    getAllSentFriendsRequest: builder.query<
      BaseServerResponse & { data: ResponseLoginType },
      { code: string }
    >({
      query: (data) => ({
        url: ``,
      }),
    }),
    getAllReceivedFriendsRequest: builder.query<
      BaseServerResponse & { data: ResponseLoginType },
      { code: string }
    >({
      query: (data) => ({
        url: ``,
      }),
    }),
    getAllFriends: builder.query<
      BaseServerResponse & { data: ResponseLoginType },
      { code: string }
    >({
      query: (data) => ({
        url: ``,
      }),
    }),
  }),
});

export const {
  useGetAllFriendsQuery,
  useGetAllReceivedFriendsRequestQuery,
  useGetAllSentFriendsRequestQuery,
  useSendFriendRequestMutation,
} = friendsApiSlice;
