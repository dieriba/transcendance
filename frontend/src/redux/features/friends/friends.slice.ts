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
  page: "FRIENDS" | "BLOCKED" | "SEND" | "RECEIVED";
}

const initialState: IFriendType = {
  friends: [],
  sentFriendsRequest: [],
  receivedFriendsRequest: [],
  blockedUser: [],
  isEstablishingConnection: false,
  isConnected: false,
  page: "RECEIVED",
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
    updatePage: (
      state,
      action: PayloadAction<"FRIENDS" | "BLOCKED" | "SEND" | "RECEIVED">
    ) => {
      state.page = action.payload;
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
    setNewUserAvatarSrc: (
      state,
      action: PayloadAction<{ friendId: string; avatar: string }>
    ) => {
      const { page } = state;
      const { friendId, avatar } = action.payload;
      if (page === "FRIENDS") {
        const index = state.friends.findIndex(
          (friend) => friend.friend.id === friendId
        );

        if (index !== -1) {
          state.friends[index].friend.profile.avatar = avatar;
        }
      } else if (page === "RECEIVED") {
        const index = state.receivedFriendsRequest.findIndex(
          (friend) => friend.sender.id === friendId
        );

        if (index !== -1) {
          state.receivedFriendsRequest[index].sender.profile.avatar = avatar;
        }
      } else if (page === "SEND") {
        const index = state.sentFriendsRequest.findIndex(
          (friend) => friend.recipient.id === friendId
        );

        if (index !== -1) {
          state.sentFriendsRequest[index].recipient.profile.avatar = avatar;
        }
      } else {
        const index = state.blockedUser.findIndex(
          (friend) => friend.id === friendId
        );

        if (index !== -1) {
          state.blockedUser[index].profile.avatar = avatar;
        }
      }
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
  setNewUserAvatarSrc,
  deleteSentFriendRequest,
  updatePage,
} = FriendsSlice.actions;

export default FriendsSlice.reducer;
