import { GeneralEvent, PongEvent } from "../../../../shared/socket.event";
import { LeaderboardType } from "../../../models/Leaderboard";
import { BaseUserTypeId } from "../../../models/login/UserSchema";
import {
  BaseServerResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { socket } from "../../../utils/getSocket";
import { apiSlice } from "../../api/apiSlice";

export const PongApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    joinQueue: builder.mutation<
      SocketServerSucessResponse & {
        data: { gameId: string };
      },
      void
    >({
      queryFn: () => {
        return new Promise((resolve) => {
          if (!socket) return;

          socket.emit(PongEvent.JOIN_QUEUE);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            socket.off(GeneralEvent.SUCCESS);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            socket.off(GeneralEvent.EXCEPTION);
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
          if (!socket) return;

          socket.emit(PongEvent.LEAVE_QUEUE);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            socket.off(GeneralEvent.SUCCESS);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            socket.off(GeneralEvent.EXCEPTION);
            resolve({ error });
          });
        });
      },
    }),
    sendGameInvitation: builder.mutation<
      SocketServerSucessResponse & {
        data: unknown;
      },
      BaseUserTypeId
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          if (!socket) return;

          socket.emit(PongEvent.SEND_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            socket.off(GeneralEvent.SUCCESS);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            socket.off(GeneralEvent.EXCEPTION);
            resolve({ error });
          });
        });
      },
    }),
    acceptGameInvitation: builder.mutation<
      SocketServerSucessResponse & {
        data: unknown;
      },
      BaseUserTypeId
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          if (!socket) return;

          socket.emit(PongEvent.ACCEPT_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            socket.off(GeneralEvent.SUCCESS);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            socket.off(GeneralEvent.EXCEPTION);
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
      BaseUserTypeId
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          if (!socket) return;

          socket.emit(PongEvent.DECLINE_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            socket.off(GeneralEvent.SUCCESS);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            socket.off(GeneralEvent.EXCEPTION);
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
} = PongApiSlice;
