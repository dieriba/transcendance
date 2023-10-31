import { io, Socket } from "socket.io-client";
import { RootState, store } from "../redux/store";

export enum NAMESPACE {
  FRIENDS = "friends",
  CHATS = "chats",
}

let socketChats: Socket;
let socketFriends: Socket;

export const getChatsSocket = () => {
  const state: RootState = store.getState();
  if (!socketChats) {
    console.log("entered inside condtion");
    console.log("Before", { socketChats, token: state.user.access_token });
    socketChats = io("http://localhost:9000/chats", {
      auth: {
        token: state.user.access_token as string,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  } else console.log("not entered inside condtion");

  return socketChats;
};


export const getFriendsSocket = () => {
  const state: RootState = store.getState();
  if (!socketFriends) {
    console.log("entered inside condtion");
    console.log("Before", { socketFriends, token: state.user.access_token });
    socketFriends = io("http://localhost:9000/friends", {
      auth: {
        token: state.user.access_token as string,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  } else console.log("not entered inside condtion");

  return socketFriends;
};
