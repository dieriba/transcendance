import { io, Socket } from "socket.io-client";
import { RootState, store } from "../redux/store";

let socket: Socket;

const connectSocket = () => {
  const state: RootState = store.getState();
  console.log(socket);
  
  if (!socket) {
    socket = io("http://localhost:9000", {
      auth: {
        token: state.user.access_token as string,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
};

export { socket, connectSocket };
