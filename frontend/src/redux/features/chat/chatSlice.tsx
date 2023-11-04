import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  MessageType,
  PrivateChatroomType,
} from "../../../models/ChatContactSchema";

export interface ChatState {
  isEstablishingConnection: boolean;
  isConnected: boolean;
  privateChatroom: PrivateChatroomType[];
  currentPrivateChatroomId: string | undefined;
  currentChatroom: PrivateChatroomType;
}

const initialState: ChatState = {
  isEstablishingConnection: false,
  isConnected: false,
  privateChatroom: [],
  currentPrivateChatroomId: undefined,
  currentChatroom: {
    id: "",
    messages: [],
    users: [],
  },
};

export const ChatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    startConnecting: (state) => {
      state.isEstablishingConnection = true;
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.isEstablishingConnection = true;
    },
    setPrivateChatroom: (
      state,
      action: PayloadAction<PrivateChatroomType[]>
    ) => {
      state.privateChatroom = action.payload;
    },
    setPrivateChatroomId: (state, action: PayloadAction<string>) => {
      state.currentPrivateChatroomId = action.payload;
      state.currentChatroom = state.privateChatroom.find(
        (chatroom) => chatroom.id === action.payload
      ) as PrivateChatroomType;
    },
    updatePrivateChatroomList: (state, action: PayloadAction<MessageType>) => {
      const message = action.payload;
      const indexToRemove = state.privateChatroom.findIndex(
        (chatroom) => chatroom.id === message.chatroomId
      );

      const removedObject = state.privateChatroom.splice(indexToRemove, 1)[0];
      removedObject.messages.push(message);

      state.privateChatroom.unshift(removedObject);
      state.currentChatroom = removedObject;
    },
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const {
  setPrivateChatroom,
  setPrivateChatroomId,
  updatePrivateChatroomList,
} = ChatSlice.actions;

export default ChatSlice.reducer;
