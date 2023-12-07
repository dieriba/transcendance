import {
  BaseUserInfoType,
  UpdatedAvatarRes,
  UserUpdated,
  UserUpdateStatusType,
} from "./../../../models/login/UserSchema";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  MessageType,
  PrivateChatroomType,
} from "../../../models/ChatContactSchema";

export interface ChatState {
  chatableUsers: BaseUserInfoType[];
  privateChatroom: PrivateChatroomType[];
  currentPrivateChatroomId: string | undefined;
  currentChatroom: PrivateChatroomType | undefined;
  messages: MessageType[];
}

const initialState: ChatState = {
  chatableUsers: [],
  privateChatroom: [],
  currentPrivateChatroomId: undefined,
  currentChatroom: undefined,
  messages: [],
};

export const ChatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setPrivateChatroom: (
      state,
      action: PayloadAction<PrivateChatroomType[]>
    ) => {
      state.privateChatroom = action.payload;
    },
    setPrivateChatroomId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      if (action.payload === state.currentPrivateChatroomId) return;

      state.currentPrivateChatroomId = action.payload;

      if (action.payload === undefined) return;

      state.messages = [];
      state.currentChatroom = state.privateChatroom?.find(
        (chatroom) => chatroom.id === action.payload
      ) as PrivateChatroomType;
    },
    setChatableUser: (state, action: PayloadAction<BaseUserInfoType[]>) => {
      state.chatableUsers = action.payload;
    },
    addNewChatroom: (state, action: PayloadAction<PrivateChatroomType>) => {
      if (action.payload) {
        const index = state.privateChatroom.findIndex(
          (chatroom) => chatroom.id === action.payload.id
        );

        if (index === -1) {
          state.privateChatroom.unshift(action.payload);
          return;
        }

        state.privateChatroom[index].users[0].user.friends =
          action.payload.users[0].user.friends;
      }
    },
    setChatroomMessage: (state, action: PayloadAction<MessageType[]>) => {
      state.messages = action.payload;
    },
    deleteChatroomById: (state, action: PayloadAction<string | undefined>) => {
      const friendId = action.payload;

      if (friendId) {
        state.privateChatroom = state.privateChatroom.filter(
          (chatroom) => chatroom.users[0].user.id !== friendId
        );

        if (state.currentChatroom?.users[0].user.id === friendId) {
          state.currentChatroom = undefined;
          state.currentPrivateChatroomId = undefined;
          state.messages = [];
        }
      }
    },
    updatePrivateChatroomList: (state, action: PayloadAction<MessageType>) => {
      const message = action.payload;
      if (message.chatroomId === state.currentPrivateChatroomId) {
        const indexToRemove = state.privateChatroom?.findIndex(
          (chatroom) => chatroom.id === message.chatroomId
        );
        const removedObject = state.privateChatroom?.splice(
          indexToRemove,
          1
        )[0];
        state.messages.push(message);
        removedObject.messages.length === 0
          ? removedObject.messages.push(message)
          : (removedObject.messages[0] = message);
        state.privateChatroom.unshift(removedObject);
      }
    },
    updateUserStatus: (state, action: PayloadAction<UserUpdateStatusType>) => {
      const { ids, status } = action.payload;

      state.privateChatroom.forEach((chatroom) => {
        if (ids.includes(chatroom.users[0].user.id)) {
          chatroom.users[0].user.status = status;
        }
      });
    },
    updateUserInfo: (
      state,
      action: PayloadAction<UserUpdated | UpdatedAvatarRes>
    ) => {
      const { id } = action.payload;
      if (state.currentChatroom) {
        const { users } = state.currentChatroom;
        if (users[0].user.id === id) {
          if ("nickname" in action.payload) {
            state.currentChatroom.users[0].user.nickname =
              action.payload.nickname;
            return;
          }
          state.currentChatroom.users[0].user.profile.avatar = (
            action.payload as UpdatedAvatarRes
          ).avatar;
        }
      }
    },
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const {
  setPrivateChatroom,
  setPrivateChatroomId,
  updatePrivateChatroomList,
  updateUserStatus,
  addNewChatroom,
  setChatroomMessage,
  deleteChatroomById,
  updateUserInfo,
  setChatableUser,
} = ChatSlice.actions;

export default ChatSlice.reducer;
