import {
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
  privateChatroom: PrivateChatroomType[];
  currentPrivateChatroomId: string | undefined;
  currentChatroom: PrivateChatroomType | undefined;
  messages: MessageType[];
}

const initialState: ChatState = {
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
      state.currentPrivateChatroomId = action.payload;
      if (action.payload !== undefined)
        state.currentChatroom = state.privateChatroom?.find(
          (chatroom) => chatroom.id === action.payload
        ) as PrivateChatroomType;
    },
    addNewChatroom: (
      state,
      action: PayloadAction<PrivateChatroomType | undefined>
    ) => {
      if (action.payload) {
        state.privateChatroom.unshift(action.payload);
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
      const indexToRemove = state.privateChatroom?.findIndex(
        (chatroom) => chatroom.id === message.chatroomId
      );

      const removedObject = state.privateChatroom?.splice(indexToRemove, 1)[0];
      if (message.chatroomId === state.currentPrivateChatroomId) {
        state.messages.push(message);
      }
      removedObject.messages.length === 0
        ? removedObject.messages.push(message)
        : (removedObject.messages[0] = message);
      state.privateChatroom.unshift(removedObject);
    },
    updateUserStatus: (state, action: PayloadAction<UserUpdateStatusType>) => {
      const { id, status } = action.payload;

      const index = state.privateChatroom.findIndex(
        (chatroom) => chatroom.users[0].user.id === id
      );

      if (index !== -1) {
        state.privateChatroom[index].users[0].user.status = status;

        if (id === state.currentChatroom?.users[0].user.id) {
          state.currentChatroom.users[0].user.status = status;
        }
      }
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
          state.currentChatroom.users[0].user.profile.avatar =
            action.payload.avatar;
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
} = ChatSlice.actions;

export default ChatSlice.reducer;
