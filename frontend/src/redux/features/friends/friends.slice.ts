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
}

const initialState: FriendType = {
  friends: [],
  sentFriendsRequest: [],
  receivedFriendsRequest: [],
};

export const Friends = createSlice({
  name: "friends",
  initialState,
  reducers: {
    updateFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
  },
});

export const {} = Friends.actions;
export default Friends.reducer;
