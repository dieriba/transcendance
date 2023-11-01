import { data } from "@emoji-mart/data";
import {
  FriendRequestType,
  ServerResponseFriendReceivedRequestType,
  ServerResponseFriendSentRequestType,
} from "../../../models/FriendRequestSchema";
import { BaseFriendType, FriendType } from "../../../models/FriendsSchema";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import {
  BaseServerResponse,
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { getFriendsSocket } from "../../../utils/getScoket";
import { apiSlice } from "../../api/apiSlice";
import { FriendEvent } from "./friends.slice";
import { showSnackBar } from "../app_notify/app.slice";

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
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
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
                dispatch(
                  showSnackBar({ message: data.message, severity: "success" })
                );
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

          socket.on(
            FriendEvent.FRIEND_REQUEST_ACCEPTED,
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
          socket.on(
            FriendEvent.FRIEND_REQUEST_ACCEPTED,
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
      },
    }),
    cancelRequest: builder.mutation<
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
    acceptFriendRequest: builder.mutation<
      SocketServerSucessResponse | SocketServerErrorResponse,
      BaseFriendType
    >({
      queryFn: (data) => {
        const socket = getFriendsSocket();
        return new Promise((resolve) => {
          socket.emit(FriendEvent.FRIEND_REQUEST_ACCEPTED, data);

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
        const socket = getFriendsSocket();
        try {
          await cacheDataLoaded;

          socket.on(
            FriendEvent.FRIEND_NEW_FRIEND,
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
        } catch (error) {
          console.log(error);
        }
        await cacheEntryRemoved;
      },
    }),
    /*deleteFriend: builder.mutation<>({
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
    }),*/
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
} = friendsApiSlice;
