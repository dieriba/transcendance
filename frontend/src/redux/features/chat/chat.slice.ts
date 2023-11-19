import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  MessageType,
  PrivateChatroomType,
} from "../../../models/ChatContactSchema";
import { BaseFriendType } from "../../../models/FriendsSchema";

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
    deleteChatroom: (state, action: PayloadAction<string | undefined>) => {
      const chatroomId = action.payload;
      console.log({ chatroomId });

      if (chatroomId) {
        state.privateChatroom = state.privateChatroom.filter(
          (chatroom) => chatroom.id !== chatroomId
        );

        if (chatroomId === state.currentChatroom?.id) {
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
    setOfflineUser: (state, action: PayloadAction<BaseFriendType>) => {
      state.privateChatroom = state.privateChatroom?.map((chatroom) => {
        const user = chatroom.users[0].user;
        return user.id === action.payload.friendId
          ? { status: (user.status = "OFFLINE"), ...chatroom }
          : chatroom;
      });
      if (action.payload.friendId === state.currentChatroom?.users[0].user.id) {
        state.currentChatroom.users[0].user.status = "OFFLINE";
      }
    },
    setOnlineUser: (state, action: PayloadAction<BaseFriendType>) => {
      state.privateChatroom = state.privateChatroom?.map((chatroom) => {
        const user = chatroom.users[0].user;
        return user.id === action.payload.friendId
          ? { status: (user.status = "ONLINE"), ...chatroom }
          : chatroom;
      });

      if (action.payload.friendId === state.currentChatroom?.users[0].user.id) {
        state.currentChatroom.users[0].user.status = "ONLINE";
      }
    },
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const {
  setPrivateChatroom,
  setPrivateChatroomId,
  updatePrivateChatroomList,
  deleteChatroom,
  setOfflineUser,
  setOnlineUser,
  addNewChatroom,
  setChatroomMessage,
} = ChatSlice.actions;

export default ChatSlice.reducer;
