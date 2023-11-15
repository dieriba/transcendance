import {
  FriendEvent,
  GeneralEvent,
} from "./../../../../../shared/socket.event";
import {
  FriendReceivedRequestType,
  FriendRequestType,
  FriendSentRequestType,
} from "../../../models/FriendRequestSchema";
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
      SocketServerSucessResponse & { data: unknown },
      FriendRequestType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.REQUEST_SENT, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });

          socket.on(
            GeneralEvent.SUCCESS,
            (data: SocketServerSucessResponse & { data: unknown }) => {
              resolve({ data });
            }
          );
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
      SocketServerSucessResponse | null,
      BaseFriendType
    >({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.CANCEL_REQUEST, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });

          socket.on(
            GeneralEvent.SUCCESS,
            (data: SocketServerSucessResponse) => {
              resolve({ data });
            }
          );
        });
      },
    }),
    acceptFriendRequest: builder.mutation<
      SocketServerSucessResponse | null,
      BaseFriendType
    >({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.REQUEST_ACCEPTED, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });

          socket.on(
            GeneralEvent.SUCCESS,
            (data: SocketServerSucessResponse) => {
              resolve({ data });
            }
          );
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
    deleteFriend: builder.mutation<SocketServerSucessResponse, BaseFriendType>({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.DELETE_FRIEND, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });

          socket.on(
            GeneralEvent.SUCCESS,
            (data: SocketServerSucessResponse) => {
              resolve({ data });
            }
          );
        });
      },
    }),
    blockFriend: builder.mutation<SocketServerSucessResponse, BaseFriendType>({
      queryFn: (data) => {
        connectSocket();

        return new Promise((resolve) => {
          socket.emit(FriendEvent.BLOCK_FRIEND, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });

          socket.on(
            GeneralEvent.SUCCESS,
            (data: SocketServerSucessResponse) => {
              resolve({ data });
            }
          );
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

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });

          socket.on(
            GeneralEvent.SUCCESS,
            (data: SocketServerSucessResponse) => {
              resolve({ data });
            }
          );
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
