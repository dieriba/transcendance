import { io, Socket } from "socket.io-client";
import { RootState, store } from "../redux/store";

let socket: Socket;

const connectSocket = () => {
  const state: RootState = store.getState();
  if (!socket) {
    socket = io("http://localhost:9000", {
      auth: (cb) => {
        cb({ token: state.user.access_token });
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
};

export const clearSocket = (events: string[]) => {
  events.map((event) => {
    if (socket.hasListeners(event)) socket.off(event);
  });
};

export { socket, connectSocket };
