import { io, Socket } from "socket.io-client";
import { RootState, store } from "../redux/store";

export enum NAMESPACE {
  FRIENDS = "friends",
  CHATS = "chats",
}

let socketChats: Socket | undefined = undefined;
let socketFriends: Socket | undefined = undefined;

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
  console.log("entered");

  if (!socketFriends) {
    console.log("Before", { socketFriends, token: state.user.access_token });
    socketFriends = io("http://localhost:9000/friends", {
      auth: {
        token: state.user.access_token as string,
      },
      transports: ["websocket"],
      withCredentials: true,
    });
  }

  return socketFriends;
};

export const clearSocketFriend = () => {
  socketFriends = undefined;
};

export const clearSocketChat = () => {
  socketChats = undefined;
};
