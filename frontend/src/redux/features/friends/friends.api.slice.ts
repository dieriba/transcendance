import { FriendEvent } from "./../../../../../shared/socket.event";
import {
  FriendRequestType,
  ServerResponseFriendReceivedRequestType,
  ServerResponseFriendSentRequestType,
} from "../../../models/FriendRequestSchema";
import { BaseFriendType, FriendType } from "../../../models/FriendsSchema";
import {
  BaseServerResponse,
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { apiSlice } from "../../api/apiSlice";
import { showSnackBar } from "../app_notify/app.slice";
import { BlockedUserType } from "../../../models/BlockedUserSchema";
import { getSocket } from "../../../utils/getSocket";

export const friendsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendFriendRequest: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      FriendRequestType
    >({
      queryFn: (data) => {
        const socket = getSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.REQUEST_SENT, data);

          socket.on(FriendEvent.NEW_REQUEST_SENT, (response) => {
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
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const socket = getSocket();

        try {
          await cacheDataLoaded;
          socket.on(
            FriendEvent.NEW_REQUEST_RECEIVED,
            (
              data: SocketServerSucessResponse & {
                data: ServerResponseFriendReceivedRequestType;
              }
            ) => {
              updateCachedData((draft) => {
                draft.data.push(data.data);
                dispatch(
                  showSnackBar({ message: data.message, severity: "success" })
                );
              });
            }
          );

          socket.on(
            FriendEvent.CANCEL_REQUEST,
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

          socket.on(
            FriendEvent.REQUEST_ACCEPTED,
            (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
              updateCachedData((draft) => {
                dispatch(
                  showSnackBar({ message: data.message, severity: "success" })
                );
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
        socket.off(FriendEvent.REQUEST_ACCEPTED);
        socket.off(FriendEvent.CANCEL_REQUEST);
        socket.off(FriendEvent.NEW_REQUEST_RECEIVED);
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
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const socket = getSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            FriendEvent.NEW_REQUEST_SENT,
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
            FriendEvent.CANCEL_REQUEST,
            (
              data: SocketServerSucessResponse & {
                data: BaseFriendType;
              }
            ) => {
              console.log(data);

              updateCachedData((draft) => {
                draft.data = draft.data.filter(
                  (obj) => obj.recipient.id !== data.data.friendId
                );
              });
            }
          );
          socket.on(
            FriendEvent.REQUEST_ACCEPTED,
            (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
              updateCachedData((draft) => {
                console.log({ data });

                dispatch(
                  showSnackBar({ message: data.message, severity: "success" })
                );
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
        socket.off(FriendEvent.REQUEST_ACCEPTED);
        socket.off(FriendEvent.CANCEL_REQUEST);
        socket.off(FriendEvent.REQUEST_SENT);
      },
    }),
    cancelRequest: builder.mutation<
      SocketServerErrorResponse | SocketServerSucessResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        const socket = getSocket();
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
        const socket = getSocket();
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
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const socket = getSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            FriendEvent.NEW_FRIEND,
            (
              data: SocketServerSucessResponse & {
                data: FriendType;
              }
            ) => {
              console.log({ data });

              updateCachedData((draft) => {
                draft.data.push(data.data);
              });
            }
          );
          socket.on(
            FriendEvent.DELETE_FRIEND,
            (
              data: SocketServerSucessResponse & {
                data: BaseFriendType;
              }
            ) => {
              updateCachedData((draft) => {
                console.log("id", data.data.friendId);

                draft.data = draft.data.filter(
                  (obj) => obj.friend.id !== data.data.friendId
                );
              });
            }
          );
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
        socket.off(FriendEvent.NEW_FRIEND);
        socket.off(FriendEvent.DELETE_FRIEND);
      },
    }),
    deleteFriend: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        const socket = getSocket();
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
        const socket = getSocket();
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
        const socket = getSocket();
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
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const socket = getSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            FriendEvent.UNBLOCK_FRIEND,
            (
              data: SocketServerSucessResponse & {
                data: BaseFriendType;
              }
            ) => {
              updateCachedData((draft) => {
                console.log("id", data.data.friendId);

                draft.data = draft.data.filter(
                  (obj) => obj.id !== data.data.friendId
                );
              });
            }
          );
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
        socket.off(FriendEvent.UNBLOCK_FRIEND);
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
  useCancelRequestMutation,
  useAcceptFriendRequestMutation,
  useDeleteFriendMutation,
  useBlockFriendMutation,
  useGetAllBlockedUserQuery,
  useUnblockFriendMutation,
} = friendsApiSlice;
