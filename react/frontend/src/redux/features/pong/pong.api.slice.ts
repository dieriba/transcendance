import { GeneralEvent, PongEvent } from "../../../../shared/socket.event";
import { Basetype } from "../../../models/BaseType";
import { LeaderboardType } from "../../../models/Leaderboard";
import { GameInvitationType, PongGameType } from "../../../models/PongSchema";
import {
  BaseServerResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { clearSocket, connectSocket, socket } from "../../../utils/getSocket";
import { apiSlice } from "../../api/apiSlice";

export const PongApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    joinBackCurrentGame: builder.mutation<
      SocketServerSucessResponse & {
        data: { gameId: string };
      },
      { gameId: string }
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(PongEvent.JOIN_BACK_CURRENT_GAME, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    joinQueue: builder.mutation<
      SocketServerSucessResponse & {
        data: { gameId: string };
      },
      PongGameType
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(PongEvent.JOIN_QUEUE, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    leaveQueue: builder.mutation<
      SocketServerSucessResponse & {
        data: unknown;
      },
      void
    >({
      queryFn: () => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(PongEvent.LEAVE_QUEUE);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    sendGameInvitation: builder.mutation<
      SocketServerSucessResponse & {
        data: unknown;
      },
      GameInvitationType
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(PongEvent.SEND_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    acceptGameInvitation: builder.mutation<
      SocketServerSucessResponse & {
        data: unknown;
      },
      Basetype
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(PongEvent.ACCEPT_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    getLeaderboard: builder.query<
      BaseServerResponse & { data: LeaderboardType[] },
      void
    >({
      query: () => ({
        url: "/pong/leaderboard",
      }),
    }),
    declineGameInvitation: builder.mutation<
      SocketServerSucessResponse & {
        data: unknown;
      },
      Basetype
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(PongEvent.DECLINE_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useJoinQueueMutation,
  useLeaveQueueMutation,
  useSendGameInvitationMutation,
  useAcceptGameInvitationMutation,
  useDeclineGameInvitationMutation,
  useGetLeaderboardQuery,
  useJoinBackCurrentGameMutation,
} = PongApiSlice;
