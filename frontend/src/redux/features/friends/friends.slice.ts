import { PayloadAction, createSlice } from "@reduxjs/toolkit";

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
