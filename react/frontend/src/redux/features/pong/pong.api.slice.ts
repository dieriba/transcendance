import { GeneralEvent, PongEvent } from "../../../../../shared/socket.event";
import { BaseUserTypeId } from "../../../models/login/UserSchema";
import { SocketServerSucessResponse } from "../../../services/type";
import { connectSocket, socket } from "../../../utils/getSocket";
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
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(PongEvent.JOIN_QUEUE);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
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
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(PongEvent.LEAVE_QUEUE);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
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
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(PongEvent.SEND_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
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
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(PongEvent.ACCEPT_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    declineGameInvitation: builder.mutation<
      SocketServerSucessResponse & {
        data: unknown;
      },
      BaseUserTypeId
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(PongEvent.DECLINE_GAME_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
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
} = PongApiSlice;
