import { editGroupResponseType } from "../../../models/EditGroupSchema";
import {
  GroupMembertype,
  JoinableChatroomType,
  UserGroupType,
  UserNewRoleResponseType,
} from "../../../models/groupChat";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ChatroomGroupType, MessageGroupType } from "../../../models/groupChat";
import {
  ChatRoleType,
  ROLE,
  Restriction,
  STATUS,
} from "../../../models/type-enum/typesEnum";
import { BaseFriendType } from "../../../models/FriendsSchema";
import { UserWithProfile } from "../../../models/ChatContactSchema";

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
  restrictedUser: UserGroupType[];
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
  restrictedUser: [],
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

      state.role = role;

      users.forEach((user) => {
        if (user.role === ROLE.DIERIBA) {
          state.admin = user;
        } else if (user.role === ROLE.CHAT_ADMIN) {
          state.chatAdmin.push(user);
        } else if (user.role === ROLE.REGULAR_USER) {
          state.regularUser.push(user);
        }
      });
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
      const prevAdminId = (state.admin as UserGroupType).user.id;
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
      if (index !== -1) {
        if (state.myId === id) {
          state.role = ROLE.DIERIBA;
        } else if (state.myId === prevAdminId) {
          state.role = ROLE.REGULAR_USER;
        }
      }
    },
    setNewRole: (state, action: PayloadAction<UserNewRoleResponseType>) => {
      const { id, role } = action.payload;
      let index: number;
      if (role === ROLE.CHAT_ADMIN) {
        index = state.chatAdmin.findIndex(
          (moderator) => moderator.user.id === id
        );

        if (index !== -1) {
          const moderator = state.chatAdmin.splice(index, 1)[0];
          moderator.role = ROLE.REGULAR_USER;
          state.regularUser.push(moderator);
        }
      } else {
        index = state.regularUser.findIndex(
          (regularUser) => regularUser.user.id === id
        );

        if (index !== -1) {
          const regularUser = state.regularUser.splice(index, 1)[0];
          regularUser.role = ROLE.CHAT_ADMIN;
          regularUser.user.restrictedGroups = [];

          state.chatAdmin.push(regularUser);
        }
      }

      if (state.myId === id) {
        if (role === ROLE.REGULAR_USER) {
          state.role = ROLE.CHAT_ADMIN;
          return;
        }
        state.role = ROLE.REGULAR_USER;
      }
    },
    setRestrictedUser: (state, action: PayloadAction<UserGroupType[]>) => {
      state.restrictedUser = action.payload;
    },
    addRestrictedUser: (state, action: PayloadAction<UserGroupType>) => {
      const {
        role,
        user: { id, restrictedGroups },
      } = action.payload;
      const { restriction } = restrictedGroups[0];

      let index: number = -1;
      if (restriction !== Restriction.MUTED) {
        if (role === ROLE.CHAT_ADMIN) {
          index = state.chatAdmin.findIndex(
            (moderator) => moderator.user.id === id
          );

          if (index !== -1) {
            state.chatAdmin.splice(index, 1);
          }
        } else {
          index = state.regularUser.findIndex(
            (regularUser) => regularUser.user.id === id
          );

          if (index !== -1) {
            state.regularUser.splice(index, 1);
          }
        }
      } else {
        if (role === ROLE.CHAT_ADMIN) {
          index = state.chatAdmin.findIndex(
            (moderator) => moderator.user.id === id
          );

          if (index !== -1) {
            state.chatAdmin.splice(index, 1);
            state.regularUser.push({
              ...action.payload,
              role: ROLE.REGULAR_USER,
            });
          }
        } else {
          index = state.regularUser.findIndex(
            (regularUser) => regularUser.user.id === id
          );

          if (index !== -1) {
            state.regularUser[index] = {
              ...action.payload,
              role: ROLE.REGULAR_USER,
            };
          }
        }
      }

      if (state.role !== ROLE.REGULAR_USER) {
        state.restrictedUser.push({
          ...action.payload,
          role: ROLE.REGULAR_USER,
        });
      }
    },
    unrestrictUser: (state, action: PayloadAction<UserWithProfile>) => {
      const { id } = action.payload;

      if (state.role === ROLE.DIERIBA || state.role === ROLE.CHAT_ADMIN) {
        const index = state.restrictedUser.findIndex(
          (user) => user.user.id === id
        );

        if (index !== -1) {
          state.restrictedUser.splice(index, 1);
        }
      }

      const pos = state.regularUser.findIndex((user) => user.user.id === id);

      if (pos !== -1) {
        state.regularUser[pos] = {
          user: { ...action.payload, restrictedGroups: [] },
          role: ROLE.REGULAR_USER,
        };
        return;
      }

      state.regularUser.push({
        user: { ...action.payload, restrictedGroups: [] },
        role: ROLE.REGULAR_USER,
      });
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
    setOfflineUser: (state, action: PayloadAction<BaseFriendType>) => {
      const { friendId } = action.payload;
      if (state.admin?.user.id === friendId) {
        state.admin.user.status = STATUS.OFFLINE;
        return;
      }
      let index: number = state.chatAdmin.findIndex(
        (user) => user.user.id === friendId
      );

      if (index !== -1) {
        state.chatAdmin[index].user.status = STATUS.OFFLINE;
        return;
      }

      index = state.regularUser.findIndex((user) => user.user.id === friendId);
      if (index !== -1) {
        state.regularUser[index].user.status = STATUS.OFFLINE;
      }
    },
    setOnlineUser: (state, action: PayloadAction<BaseFriendType>) => {
      const { friendId } = action.payload;
      if (state.admin?.user.id === friendId) {
        state.admin.user.status = STATUS.ONLINE;
        return;
      }
      let index: number = state.chatAdmin.findIndex(
        (user) => user.user.id === friendId
      );
      console.log({ index, friendId });

      if (index !== -1) {
        state.chatAdmin[index].user.status = STATUS.ONLINE;
        return;
      }

      index = state.regularUser.findIndex((user) => user.user.id === friendId);
      if (index !== -1) {
        state.regularUser[index].user.status = STATUS.ONLINE;
      }
    },
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const {
  setGroupChatroom,
  setGroupChatroomId,
  updateGroupChatroomListAndMessage,
  deleteChatroom,
  setChatroomMessage,
  setRestrictedUser,
  unrestrictUser,
  addNewJoinableGroup,
  setJoinableGroup,
  deleteJoinableGroup,
  setOfflineUser,
  setOnlineUser,
  addNewChatroom,
  updateChatroom,
  setGroupMembersAndRole,
  addNewGroupMember,
  addRestrictedUser,
  setNewAdmin,
  deleteGroupMembers,
  setNewRole,
  toggleOpenGroupSidebar,
  setMyId,
} = GroupSlice.actions;

export default GroupSlice.reducer;
