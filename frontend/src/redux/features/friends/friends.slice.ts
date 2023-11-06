import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  FriendReceivedRequestType,
  FriendSentRequestType,
} from "../../../models/FriendRequestSchema";
import { BlockedUserType } from "../../../models/BlockedUserSchema";
import { FriendType, BaseFriendType } from "../../../models/FriendsSchema";

export interface IFriendType {
  friends: FriendType[];
  sentFriendsRequest: FriendSentRequestType[];
  receivedFriendsRequest: FriendReceivedRequestType[];
  blockedUser: BlockedUserType[];
  isEstablishingConnection: boolean;
  isConnected: boolean;
}

const initialState: IFriendType = {
  friends: [],
  sentFriendsRequest: [],
  receivedFriendsRequest: [],
  blockedUser: [],
  isEstablishingConnection: false,
  isConnected: false,
};

export const FriendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<FriendType[]>) => {
      state.friends = action.payload;
    },
    startConnecting: (state) => {
      state.isEstablishingConnection = true;
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.isEstablishingConnection = true;
    },
    setFriendRequestReceived: (
      state,
      action: PayloadAction<FriendReceivedRequestType[]>
    ) => {
      state.receivedFriendsRequest = action.payload;
    },
    setFriendRequestSent: (
      state,
      action: PayloadAction<FriendSentRequestType[]>
    ) => {
      state.sentFriendsRequest = action.payload;
    },
    setBlockedUser: (state, action: PayloadAction<BlockedUserType[]>) => {
      state.blockedUser = action.payload;
    },
    addNewFriendRequestReceived: (
      state,
      action: PayloadAction<FriendReceivedRequestType>
    ) => {
      state.receivedFriendsRequest.push(action.payload);
    },
    addNewFriendRequestSent: (
      state,
      action: PayloadAction<FriendSentRequestType>
    ) => {
      state.sentFriendsRequest.push(action.payload);
    },
    deleteReceivedFriendRequest: (
      state,
      action: PayloadAction<BaseFriendType>
    ) => {
      state.receivedFriendsRequest = state.receivedFriendsRequest.filter(
        (obj) => obj.sender.id !== action.payload.friendId
      );
    },
    deleteSentFriendRequest: (state, action: PayloadAction<BaseFriendType>) => {
      state.sentFriendsRequest = state.sentFriendsRequest.filter(
        (obj) => obj.recipient.id !== action.payload.friendId
      );
    },
    removeBlockedUser: (state, action: PayloadAction<BaseFriendType>) => {
      state.blockedUser = state.blockedUser.filter(
        (obj) => obj.id !== action.payload.friendId
      );
    },
    addFriend: (state, action: PayloadAction<FriendType>) => {
      state.friends.push(action.payload);
    },
    deleteFriend: (state, action: PayloadAction<BaseFriendType>) => {
      state.friends = state.friends.filter(
        (obj) => obj.friend.id !== action.payload.friendId
      );
    },
  },
});

export const {
  setFriends,
  setFriendRequestReceived,
  setFriendRequestSent,
  setBlockedUser,
  startConnecting,
  connectionEstablished,
  addNewFriendRequestReceived,
  addNewFriendRequestSent,
  addFriend,
  removeBlockedUser,
  deleteFriend,
  deleteReceivedFriendRequest,
  deleteSentFriendRequest,
} = FriendsSlice.actions;

export default FriendsSlice.reducer;
