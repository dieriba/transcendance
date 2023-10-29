import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { BaseServerResponse } from "../../../services/type";
import { apiSlice } from "../../api/apiSlice";

export const friendsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
} = friendsApiSlice;
