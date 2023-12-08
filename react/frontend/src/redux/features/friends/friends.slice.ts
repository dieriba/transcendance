import { BaseUserInfoType } from "./../../../models/login/UserSchema";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  FriendReceivedRequestType,
  FriendSentRequestType,
} from "../../../models/FriendRequestSchema";
import { BlockedUserType } from "../../../models/BlockedUserSchema";
import { FriendType, BaseFriendType } from "../../../models/FriendsSchema";
import {
  UpdatedAvatarRes,
  UserUpdateStatusType,
  UserUpdated,
} from "../../../models/login/UserSchema";

export interface IFriendType {
  friends: FriendType[];
  sentFriendsRequest: FriendSentRequestType[];
  receivedFriendsRequest: FriendReceivedRequestType[];
  blockedUser: BlockedUserType[];
  isEstablishingConnection: boolean;
  isConnected: boolean;
  page: "FRIENDS" | "BLOCKED" | "SENT" | "RECEIVED";
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
      action: PayloadAction<"FRIENDS" | "BLOCKED" | "SENT" | "RECEIVED">
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
    addBlockedUser: (state, action: PayloadAction<BaseUserInfoType>) => {
      const { id } = action.payload;
      const index = state.blockedUser.findIndex((user) => user.id === id);

      if (index !== -1) {
        state.blockedUser.unshift(action.payload);
      }
    },
    removeBlockedUser: (state, action: PayloadAction<string>) => {
      const index = state.blockedUser.findIndex(
        (user) => user.id === action.payload
      );

      if (index !== -1) {
        state.blockedUser.splice(index, 1);
      }
    },
    addFriend: (state, action: PayloadAction<FriendType>) => {
      state.friends.push(action.payload);
    },
    deleteFriend: (state, action: PayloadAction<BaseFriendType>) => {
      state.friends = state.friends.filter(
        (obj) => obj.friend.id !== action.payload.friendId
      );
    },
    updateUserStatus: (state, action: PayloadAction<UserUpdateStatusType>) => {
      const { ids, status } = action.payload;

      state.friends.forEach((friend) => {
        if (ids.includes(friend.friend.id)) {
          friend.friend.status = status;
        }
      });
    },
    updateFriendInfo: (state, action: PayloadAction<UserUpdated>) => {
      const { page } = state;
      const { id, nickname } = action.payload;

      if (page === "FRIENDS") {
        const index = state.friends.findIndex(
          (friend) => friend.friend.id === id
        );

        if (index !== -1) {
          state.friends[index].friend.nickname = nickname;
        }
      } else if (page === "RECEIVED") {
        const index = state.receivedFriendsRequest.findIndex(
          (friend) => friend.sender.id === id
        );

        if (index !== -1) {
          state.receivedFriendsRequest[index].sender.nickname = nickname;
        }
      } else if (page === "SENT") {
        const index = state.sentFriendsRequest.findIndex(
          (friend) => friend.recipient.id === id
        );

        if (index !== -1) {
          state.sentFriendsRequest[index].recipient.nickname = nickname;
        }
      } else {
        const index = state.blockedUser.findIndex((friend) => friend.id === id);

        if (index !== -1) {
          state.blockedUser[index].nickname = nickname;
        }
      }
    },
    setNewUserAvatarSrc: (state, action: PayloadAction<UpdatedAvatarRes>) => {
      const { page } = state;
      const { id, avatar } = action.payload;
      if (page === "FRIENDS") {
        const index = state.friends.findIndex(
          (friend) => friend.friend.id === id
        );

        if (index !== -1) {
          state.friends[index].friend.profile.avatar = avatar;
        }
      } else if (page === "RECEIVED") {
        const index = state.receivedFriendsRequest.findIndex(
          (friend) => friend.sender.id === id
        );

        if (index !== -1) {
          state.receivedFriendsRequest[index].sender.profile.avatar = avatar;
        }
      } else if (page === "SENT") {
        const index = state.sentFriendsRequest.findIndex(
          (friend) => friend.recipient.id === id
        );

        if (index !== -1) {
          state.sentFriendsRequest[index].recipient.profile.avatar = avatar;
        }
      } else {
        const index = state.blockedUser.findIndex((friend) => friend.id === id);

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
  addBlockedUser,
  removeBlockedUser,
  deleteFriend,
  deleteReceivedFriendRequest,
  setNewUserAvatarSrc,
  deleteSentFriendRequest,
  updatePage,
  updateUserStatus,
  updateFriendInfo,
} = FriendsSlice.actions;

export default FriendsSlice.reducer;
