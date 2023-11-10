import { JoinableChatroomType } from "./../../../models/groupChat";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ChatroomGroupType, MessageGroupType } from "../../../models/groupChat";

export interface ChatState {
  joinableGroup: JoinableChatroomType[];
  groupChatroom: ChatroomGroupType[];
  currentGroupChatroomId: string | undefined;
  currentChatroom: ChatroomGroupType | undefined;
  messages: MessageGroupType[];
}

const initialState: ChatState = {
  joinableGroup: [],
  groupChatroom: [],
  currentGroupChatroomId: undefined,
  currentChatroom: undefined,
  messages: [],
};

export const GroupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setGroupChatroom: (state, action: PayloadAction<ChatroomGroupType[]>) => {
      state.groupChatroom = action.payload;
    },
    setJoinableGroup: (
      state,
      action: PayloadAction<JoinableChatroomType[]>
    ) => {
      state.joinableGroup = action.payload;
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
    addNewJoinableGroup: (
      state,
      action: PayloadAction<JoinableChatroomType>
    ) => {
      state.joinableGroup.push(action.payload);
    },
    setChatroomMessage: (state, action: PayloadAction<MessageGroupType[]>) => {
      if (state.currentChatroom) {
        state.messages = action.payload;
      }
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
    deleteJoinableGroup: (state, action: PayloadAction<string>) => {
      const chatroomId = action.payload;
      state.joinableGroup = state.joinableGroup.filter(
        (chatroom) => chatroom.id !== chatroomId
      );
    },
    updateGroupChatroomListAndMessage: (
      state,
      action: PayloadAction<MessageGroupType>
    ) => {
      const message = action.payload;
      const indexToRemove = state.groupChatroom.findIndex(
        (chatroom) => chatroom.id === message.chatroomId
      );

      if (indexToRemove >= 0) {
        const removedObject = state.groupChatroom.splice(indexToRemove, 1)[0];
        if (message.chatroomId === state.currentChatroom?.id)
          state.messages.push(message);
        removedObject.messages[0] = message;
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
  updateGroupChatroomListAndMessage,
  deleteChatroom,
  setChatroomMessage,
  addNewJoinableGroup,
  setJoinableGroup,
  deleteJoinableGroup,
  /*setOfflineUser,
  setOnlineUser,*/
  addNewChatroom,
} = GroupSlice.actions;

export default GroupSlice.reducer;
