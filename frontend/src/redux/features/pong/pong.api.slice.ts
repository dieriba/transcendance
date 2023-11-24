import { GeneralEvent, PongEvent } from "../../../../../shared/socket.event";
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
  }),
  overrideExisting: false,
});

export const { useJoinQueueMutation, useLeaveQueueMutation } = PongApiSlice;
