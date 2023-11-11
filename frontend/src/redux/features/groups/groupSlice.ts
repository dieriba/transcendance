import {
  GroupMembertype,
  JoinableChatroomType,
  ROLE,
  UserGroupType,
} from "./../../../models/groupChat";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ChatroomGroupType, MessageGroupType } from "../../../models/groupChat";

export interface GroupState {
  joinableGroup: JoinableChatroomType[];
  groupChatroom: ChatroomGroupType[];
  currentGroupChatroomId: string | undefined;
  currentChatroom: ChatroomGroupType | undefined;
  messages: MessageGroupType[];
  role: string | undefined;
  admin: UserGroupType | undefined;
  chatAdmin: UserGroupType[];
  regularUser: UserGroupType[];
}

const initialState: GroupState = {
  joinableGroup: [],
  groupChatroom: [],
  currentGroupChatroomId: undefined,
  currentChatroom: undefined,
  messages: [],
  role: undefined,
  admin: undefined,
  chatAdmin: [],
  regularUser: [],
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
    setGroupMembersAndRole: (state, action: PayloadAction<GroupMembertype>) => {
      const { users, role } = action.payload;
      users.forEach((user) => {
        if (user.role === ROLE.DIERIBA) {
          state.admin = user;
        } else if (user.role === ROLE.CHAT_ADMIN) {
          state.chatAdmin.push(user);
        } else if (user.role === ROLE.REGULAR_USER) {
          state.regularUser.push(user);
        }
      });
      state.role = role;
    },
    setGroupChatroomId: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload !== undefined) {
        state.currentGroupChatroomId = action.payload;
        state.currentChatroom = state.groupChatroom?.find(
          (chatroom) => chatroom.id === action.payload
        );
        state.role = undefined;
        state.admin = undefined;
        state.chatAdmin = [];
        state.regularUser = [];
      }
    },
    addNewChatroom: (state, action: PayloadAction<ChatroomGroupType>) => {
      state.groupChatroom.unshift(action.payload);
    },
    addNewGroupMember: (
      state,
      action: PayloadAction<{
        role: "DIERIBA" | "CHAT_ADMIN" | "REGULAR_USER";
        user: UserGroupType;
      }>
    ) => {
      const { role, user } = action.payload;

      if (role === "CHAT_ADMIN") {
        state.chatAdmin.push(user);
      } else if (role === "REGULAR_USER") {
        state.chatAdmin.push(user);
      }
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
    deleteGroupMembers: (
      state,
      action: PayloadAction<{
        role: "DIERIBA" | "CHAT_ADMIN" | "REGULAR_USER";
        userId: string;
      }>
    ) => {
      const { userId, role } = action.payload;
      if (role === "CHAT_ADMIN") {
        state.chatAdmin = state.chatAdmin.filter(
          (member) => member.user.id !== userId
        );
      } else if (role === "REGULAR_USER") {
        state.regularUser = state.chatAdmin.filter(
          (member) => member.user.id !== userId
        );
      }
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
  setGroupMembersAndRole,
  addNewGroupMember,
  deleteGroupMembers,
} = GroupSlice.actions;

export default GroupSlice.reducer;
