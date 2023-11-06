import { FriendEvent } from "./../../../../../shared/socket.event";
import { FriendReceivedRequestType, FriendRequestType, FriendSentRequestType } from "../../../models/FriendRequestSchema";
import { BaseFriendType, FriendType } from "../../../models/FriendsSchema";
import {
  BaseServerResponse,
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { apiSlice } from "../../api/apiSlice";
import { BlockedUserType } from "../../../models/BlockedUserSchema";
import { connectSocket, socket } from "../../../utils/getSocket";

export const friendsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendFriendRequest: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      FriendRequestType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise(() => {
          socket.emit(FriendEvent.REQUEST_SENT, data);
        });
      },
    }),
    getAllReceivedFriendsRequest: builder.query<
      BaseServerResponse & {
        data: FriendReceivedRequestType[];
      },
      void
    >({
      query: () => ({
        url: "/friends/received-friends-request",
      }),
    }),
    getAllSentFriendsRequest: builder.query<
      BaseServerResponse & { data: FriendSentRequestType[] },
      void
    >({
      query: () => ({
        url: "/friends/sent-friends-request",
      }),
    }),
    cancelRequest: builder.mutation<
      SocketServerErrorResponse | SocketServerSucessResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.CANCEL_REQUEST, data);

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    acceptFriendRequest: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.REQUEST_ACCEPTED, data);

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getAllFriends: builder.query<
      BaseServerResponse & { data: FriendType[] },
      void
    >({
      query: () => ({
        url: "/friends/get-all-friends",
      }),
    }),
    deleteFriend: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.DELETE_FRIEND, data);

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    blockFriend: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.BLOCK_FRIEND, data);

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    unblockFriend: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.UNBLOCK_FRIEND, data);

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getAllBlockedUser: builder.query<
      BaseServerResponse & { data: BlockedUserType[] },
      void
    >({
      query: () => ({
        url: "friends/get-all-blocked-user",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllFriendsQuery,
  useGetAllReceivedFriendsRequestQuery,
  useGetAllSentFriendsRequestQuery,
  useSendFriendRequestMutation,
  useCancelRequestMutation,
  useAcceptFriendRequestMutation,
  useDeleteFriendMutation,
  useBlockFriendMutation,
  useGetAllBlockedUserQuery,
  useUnblockFriendMutation,
} = friendsApiSlice;
