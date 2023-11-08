import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { BaseFriendType } from "../../../models/FriendsSchema";
import { ChatroomGroupType, MessageGroupType } from "../../../models/groupChat";

export interface ChatState {
  groupChatroom: ChatroomGroupType[];
  currentGroupChatroomId: string | undefined;
  currentChatroom: ChatroomGroupType | undefined;
  messages: Map<string, MessageGroupType[]>;
}

const initialState: ChatState = {
  groupChatroom: [],
  currentGroupChatroomId: undefined,
  currentChatroom: undefined,
  messages: new Map<string, MessageGroupType[]>(),
};

export const GroupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setGroupChatroom: (state, action: PayloadAction<ChatroomGroupType[]>) => {
      state.groupChatroom = action.payload;
    },
    setGroupChatroomId: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload !== undefined)
        state.currentGroupChatroomId = action.payload;
      state.currentChatroom = state.groupChatroom?.find(
        (chatroom) => chatroom.id === action.payload
      );
    },
    addNewChatroom: (state, action: PayloadAction<ChatroomGroupType>) => {
      state.groupChatroom.unshift(action.payload);
    },
    deleteChatroom: (state, action: PayloadAction<string>) => {
      const chatroomId = action.payload;
      state.groupChatroom = state.groupChatroom.filter((chatroom) => {
        chatroom.id !== chatroomId;
      });
      if (chatroomId === state.currentChatroom?.id) {
        state.currentChatroom = undefined;
        state.currentGroupChatroomId = undefined;
      }
    },
    updateGroupChatroomList: (
      state,
      action: PayloadAction<MessageGroupType>
    ) => {
      const message = action.payload;
      const indexToRemove = state.groupChatroom.findIndex(
        (chatroom) => chatroom.id === message.chatroomId
      );

      if (indexToRemove >= 0) {
        const removedObject = state.groupChatroom.splice(indexToRemove, 1)[0];
        state.messages.get(removedObject.chatroomName)?.push(message);
        state.currentChatroom = removedObject;
        state.groupChatroom.unshift(removedObject);
      }
    },
    /*setOfflineUser: (state, action: PayloadAction<BaseFriendType>) => {
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
    },*/
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const {
  setGroupChatroom,
  setGroupChatroomId,
  updateGroupChatroomList,
  deleteChatroom,
  /*setOfflineUser,
  setOnlineUser,*/
  addNewChatroom,
} = GroupSlice.actions;

export default GroupSlice.reducer;