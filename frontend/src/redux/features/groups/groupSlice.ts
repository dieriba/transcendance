import { editGroupResponseType } from "./../../../models/EditGroupSchema";
import {
  GroupMembertype,
  JoinableChatroomType,
  UserGroupType,
  UserNewRoleResponseType,
} from "./../../../models/groupChat";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ChatroomGroupType, MessageGroupType } from "../../../models/groupChat";
import { ChatRoleType, ROLE } from "../../../models/type-enum/typesEnum";

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
  openGroupSidebar: boolean;
  myId: string | undefined;
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
  openGroupSidebar: false,
  myId: undefined,
};

export const GroupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    toggleOpenGroupSidebar: (state) => {
      state.openGroupSidebar = !state.openGroupSidebar;
      state.chatAdmin = [];
      state.regularUser = [];
    },
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

      if (state.chatAdmin.length > 0) state.chatAdmin = [];
      if (state.regularUser.length > 0) state.regularUser = [];

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
    updateChatroom: (state, action: PayloadAction<editGroupResponseType>) => {
      const { chatroomId, type } = action.payload;
      const index = state.groupChatroom.findIndex(
        (chatroom) => chatroom.id === chatroomId
      );

      console.log("In updated chatroom");

      if (index !== -1) {
        state.groupChatroom[index].type = type;
        if (
          state.currentChatroom &&
          chatroomId === state.currentGroupChatroomId
        ) {
          state.currentChatroom.type = type;
        }
      }
    },
    setMyId: (state, action: PayloadAction<string>) => {
      state.myId = action.payload;
    },
    setNewAdmin: (state, action: PayloadAction<UserNewRoleResponseType>) => {
      const { id, role } = action.payload;

      let index: number;
      let newAdmin: UserGroupType;
      if (role === "CHAT_ADMIN") {
        index = state.chatAdmin.findIndex(
          (moderator) => moderator.user.id === id
        );
        if (index !== -1) {
          (state.admin as UserGroupType).role = ROLE.REGULAR_USER;
          newAdmin = state.chatAdmin.splice(index, 1)[0];
          newAdmin.role = ROLE.DIERIBA;
          state.regularUser.push(state.admin as UserGroupType);
          state.admin = newAdmin;
        }
      } else {
        index = state.regularUser.findIndex(
          (regularUser) => regularUser.user.id === id
        );
        if (index !== -1) {
          (state.admin as UserGroupType).role = ROLE.REGULAR_USER;
          newAdmin = state.regularUser.splice(index, 1)[0];
          newAdmin.role = ROLE.DIERIBA;
          state.regularUser.push(state.admin as UserGroupType);
          state.admin = newAdmin;
        }
      }
      if (state.myId === state.admin?.user.id) {
        state.role = ROLE.DIERIBA;
      } else {
        state.role = ROLE.REGULAR_USER;
      }
    },
    setNewRole: (state, action: PayloadAction<UserNewRoleResponseType>) => {
      const { id, role } = action.payload;
      console.log(action.payload);
      let index: number;
      if (role === "CHAT_ADMIN") {
        index = state.chatAdmin.findIndex(
          (moderator) => moderator.user.id === id
        );
        console.log({ indexMod: index });

        if (index !== -1) {
          const moderator = state.chatAdmin.splice(index, 1)[0];
          moderator.role = ROLE.REGULAR_USER;
          state.regularUser.push(moderator);
        }
      } else {
        index = state.regularUser.findIndex(
          (regularUser) => regularUser.user.id === id
        );
        console.log({ index });

        if (index !== -1) {
          const regularUser = state.regularUser.splice(index, 1)[0];
          regularUser.role = ROLE.CHAT_ADMIN;
          state.chatAdmin.push(regularUser);
        }
      }
    },
    addNewGroupMember: (
      state,
      action: PayloadAction<{
        role: ChatRoleType;
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
        role: ChatRoleType;
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
  updateChatroom,
  setGroupMembersAndRole,
  addNewGroupMember,
  setNewAdmin,
  deleteGroupMembers,
  setNewRole,
  toggleOpenGroupSidebar,
  setMyId,
} = GroupSlice.actions;

export default GroupSlice.reducer;
