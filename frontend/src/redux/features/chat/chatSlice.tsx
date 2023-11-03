import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PrivateChatroomType } from "../../../models/ChatContactSchema";

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
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const { setPrivateChatroom, setPrivateChatroomId } = ChatSlice.actions;

export default ChatSlice.reducer;
