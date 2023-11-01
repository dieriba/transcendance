import { data } from "@emoji-mart/data";
import {
  FriendRequestType,
  ServerResponseFriendReceivedRequestType,
  ServerResponseFriendSentRequestType,
} from "../../../models/FriendRequestSchema";
import { BaseFriendType } from "../../../models/FriendsSchema";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import {
  BaseServerResponse,
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { getFriendsSocket } from "../../../utils/getScoket";
import { apiSlice } from "../../api/apiSlice";
import { FriendEvent } from "./friends.slice";

export const friendsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendFriendRequest: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      FriendRequestType
    >({
      queryFn: (data) => {
        const socket = getFriendsSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.FRIEND_REQUEST_SENT, data);

          socket.on(FriendEvent.FRIEND_REQUEST_SENT, (response) => {
            resolve({ data: response });
          });

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getAllReceivedFriendsRequest: builder.query<
      BaseServerResponse & {
        data: ServerResponseFriendReceivedRequestType[];
      },
      void
    >({
      query: () => ({
        url: "/friends/received-friends-request",
      }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const socket = getFriendsSocket();

        try {
          await cacheDataLoaded;
          socket.on(
            FriendEvent.FRIEND_REQUEST_RECEIVED,
            (
              data: SocketServerSucessResponse & {
                data: ServerResponseFriendReceivedRequestType;
              }
            ) => {
              updateCachedData((draft) => {
                draft.data.push(data.data);
              });
            }
          );

          socket.on(
            FriendEvent.FRIEND_CANCEL_FRIEND_REQUEST,
            (
              data: SocketServerSucessResponse & {
                data: BaseFriendType;
              }
            ) => {
              updateCachedData((draft) => {
                console.log({ draft: draft.data });

                draft.data = draft.data.filter(
                  (obj) => obj.sender.id !== data.data.friendId
                );
              });
            }
          );
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
      },
    }),
    getAllSentFriendsRequest: builder.query<
      BaseServerResponse & { data: ServerResponseFriendSentRequestType[] },
      void
    >({
      query: () => ({
        url: "/friends/sent-friends-request",
      }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const socket = getFriendsSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            FriendEvent.FRIEND_REQUEST_SENT,
            (
              data: SocketServerSucessResponse & {
                data: ServerResponseFriendSentRequestType;
              }
            ) => {
              console.log({ data });

              updateCachedData((draft) => {
                draft.data.push(data.data);
              });
            }
          );

          socket.on(
            FriendEvent.FRIEND_CANCEL_FRIEND_REQUEST,
            (
              data: SocketServerSucessResponse & {
                data: BaseFriendType;
              }
            ) => {
              updateCachedData((draft) => {
                console.log({ draft: draft.data });

                draft.data = draft.data.filter(
                  (obj) => obj.recipient.id !== data.data.friendId
                );
              });
            }
          );
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
      },
    }),
    cancelReceivedRequest: builder.mutation<
      SocketServerErrorResponse | SocketServerSucessResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        const socket = getFriendsSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.FRIEND_CANCEL_FRIEND_REQUEST, data);

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    cancelSentRequest: builder.mutation<
      SocketServerErrorResponse | SocketServerSucessResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        const socket = getFriendsSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.FRIEND_REQUEST_SENT, data);

          socket.on(FriendEvent.FRIEND_REQUEST_SENT, (response) => {
            resolve({ data: response });
          });

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getAllFriends: builder.query<
      BaseServerResponse & { data: ResponseLoginType },
      { code: string }
    >({
      query: (data) => ({
        url: ``,
      }),
    }),
    deleteFriend: builder.mutation<>({
      queryFn: (data) => {
        const socket = getFriendsSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.FRIEND_REQUEST_SENT, data);

          socket.on(FriendEvent.FRIEND_REQUEST_SENT, (response) => {
            resolve({ data: response });
          });

          socket.on("exception", (error) => {
            resolve({ error });
          });
        });
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllFriendsQuery,
  useGetAllReceivedFriendsRequestQuery,
  useGetAllSentFriendsRequestQuery,
  useSendFriendRequestMutation,
  useCancelReceivedRequestMutation,
} = friendsApiSlice;
