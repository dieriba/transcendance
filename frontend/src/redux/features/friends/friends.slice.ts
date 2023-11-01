import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export enum FriendEvent {
  FRIEND_REQUEST_RECEIVED = "FRIEND_REQUEST_RECEIVED",
  FRIEND_REQUEST_SENT = "FRIEND_REQUEST_SENT",
  FRIEND_CANCEL_FRIEND_REQUEST = "FRIEND_CANCEL_FRIEND_REQUEST",
  FRIEND_CLEAR_FRIEND_REQUEST = "FRIEND_CLEAR_FRIEND_REQUEST",
  FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED",
  FRIEND_DELETE_FRIEND = "FRIEND_DELETE_FRIEND",
  FRIEND_BLOCKED_FRIEND = "FRIEND_BLOCKED_FRIEND",
  FRIEND_NEW_FRIEND = "FRIEND_NEW_FRIEND",
}

export interface Friend {
  id: string;
  nickname: string;
  online: boolean;
}

export interface FriendType {
  friends: Friend[];
  sentFriendsRequest: Friend[];
  receivedFriendsRequest: Friend[];
  isEstablishingConnection: boolean;
  isConnected: boolean;
}

const initialState: FriendType = {
  friends: [],
  sentFriendsRequest: [],
  receivedFriendsRequest: [],
  isEstablishingConnection: false,
  isConnected: false,
};

export const Friends = createSlice({
  name: "friends",
  initialState,
  reducers: {
    updateFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
    startConnecting: (state) => {
      state.isEstablishingConnection = true;
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.isEstablishingConnection = true;
    },
  },
});

export const { updateFriends, startConnecting, connectionEstablished } =
  Friends.actions;
export default Friends.reducer;
