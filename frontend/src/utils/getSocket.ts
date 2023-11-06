import { io, Socket } from "socket.io-client";
import { RootState, store } from "../redux/store";

let socket: Socket;

const connectSocket = () => {
  const state: RootState = store.getState();

  if (!socket) {
    console.log("entered inside condtion");
    console.log("Before", { socket, token: state.user.access_token });
    socket = io("http://localhost:9000", {
      auth: {
        token: state.user.access_token as string,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  } else console.log("not entered inside condtion");
};

export { socket, connectSocket };
