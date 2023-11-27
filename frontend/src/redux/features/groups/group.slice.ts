import {
  BaseChatroomType,
  BaseChatroomTypeId,
  BaseChatroomWithUserIdType,
  GroupInvitation,
  PreviousAdminLeaveType,
} from "./../../../models/groupChat";
import { editGroupResponseType } from "../../../models/EditGroupSchema";
import {
  GroupMembertype,
  JoinableChatroomType,
  RestrictedUserResponseType,
  UnrestrictType,
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
import {
  UserProfileBanLifeType,
  UserWithProfileFriendsType,
} from "../../../models/ChatContactSchema";
import { BaseUserTypeId } from "../../../models/login/UserSchema";
import { AlertColor } from "@mui/material";

export interface GroupState {
  groupInvitation: GroupInvitation | undefined;
  joinableGroup: JoinableChatroomType[];
  groupChatroom: ChatroomGroupType[];
  currentGroupChatroomId: string | undefined;
  currentChatroom: ChatroomGroupType | undefined;
  messages: MessageGroupType[];
  role: ChatRoleType | undefined;
  admin: UserGroupType | undefined;
  chatAdmin: UserGroupType[];
  regularUser: UserGroupType[];
  restrictedUser: UserGroupType[];
  openGroupSidebar: boolean;
  myId: string | undefined;
  blockedUser: BaseUserTypeId[];
  blockedBy: BaseUserTypeId[];
  message: string;
  severity: AlertColor;
  open: boolean;
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
  blockedUser: [],
  blockedBy: [],
  message: "",
  severity: "success",
  open: false,
  groupInvitation: undefined,
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
    setGroupChatroom: (
      state,
      action: PayloadAction<{
        chatrooms: ChatroomGroupType[];
        blockedUser: BaseUserTypeId[];
        blockedBy: BaseUserTypeId[];
      }>
    ) => {
      const { chatrooms, blockedBy, blockedUser } = action.payload;
      state.groupChatroom = chatrooms;
      state.blockedUser = blockedUser;
      state.blockedBy = blockedBy;
    },
    setJoinableGroup: (
      state,
      action: PayloadAction<JoinableChatroomType[]>
    ) => {
      state.joinableGroup = action.payload;
    },
    setGroupInvitation: (state, action: PayloadAction<GroupInvitation>) => {
      state.groupInvitation = action.payload;
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
        } else {
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
        return;
      }
      state.currentGroupChatroomId = undefined;
    },
    addNewChatroom: (state, action: PayloadAction<ChatroomGroupType>) => {
      state.groupChatroom.unshift(action.payload);
    },
    addNewChatroomUser: (
      state,
      action: PayloadAction<UserWithProfileFriendsType>
    ) => {
      state.regularUser.unshift({
        user: { ...action.payload, restrictedGroups: [] },
        role: ROLE.REGULAR_USER,
      });
    },
    updateChatroom: (state, action: PayloadAction<editGroupResponseType>) => {
      const { chatroomId, type } = action.payload;
      const index = state.groupChatroom.findIndex(
        (chatroom) => chatroom.id === chatroomId
      );

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
      if (role === ROLE.CHAT_ADMIN) {
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
    previousAdminLeaved: (
      state,
      action: PayloadAction<PreviousAdminLeaveType>
    ) => {
      const { newAdminId, newAdminPreviousRole } = action.payload;

      if (newAdminPreviousRole === ROLE.CHAT_ADMIN) {
        const previousAdminIndex = state.chatAdmin.findIndex(
          (user) => user.user.id === newAdminId
        );

        if (previousAdminIndex === -1) {
          return;
        }

        if (state.myId === newAdminId) {
          state.role = state.admin?.role;
        }

        const admin = state.chatAdmin.splice(previousAdminIndex, 1)[0];

        state.admin = admin;
      } else {
        state.regularUser.map((user) => {
          console.log({ user });
        });

        const previousAdminIndex = state.regularUser.findIndex(
          (user) => user.user.id === newAdminId
        );

        if (previousAdminIndex === -1) {
          return;
        }

        if (state.myId === newAdminId) {
          state.role = state.admin?.role;
        }

        const admin = state.regularUser.splice(previousAdminIndex, 1)[0];

        state.admin = admin;
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
    restrict: (state, action: PayloadAction<RestrictedUserResponseType>) => {
      const { chatroomId, ...data } = action.payload;
      const index = state.groupChatroom.findIndex(
        (chatroom) => chatroom.id === chatroomId
      );

      if (index !== -1) {
        if (
          data.restriction !== Restriction.MUTED &&
          state.currentGroupChatroomId == chatroomId
        ) {
          state.currentChatroom = undefined;
          state.currentGroupChatroomId = undefined;
          state.messages = [];
          state.regularUser = [];
          state.chatAdmin = [];
          state.admin = undefined;
          state.role = undefined;
        } else if (data.restriction === Restriction.MUTED) {
          if (state.currentChatroom) {
            state.currentChatroom.restrictedUsers.length === 0
              ? state.currentChatroom.restrictedUsers.push(data)
              : (state.currentChatroom.restrictedUsers[0] = data);
          }
        }

        if (!data.banLife) {
          state.groupChatroom[index].restrictedUsers.length === 0
            ? state.groupChatroom[index].restrictedUsers.push(data)
            : (state.groupChatroom[index].restrictedUsers[0] = data);
          return;
        }
        state.groupChatroom.splice(index, 1);
      }
    },
    unrestrict: (state, action: PayloadAction<UnrestrictType>) => {
      const { message, chatroomId, restriction } = action.payload;
      const index = state.groupChatroom.findIndex(
        (chatroom) => chatroom.id === chatroomId
      );

      if (index !== -1) {
        if (
          restriction !== Restriction.MUTED &&
          state.currentGroupChatroomId === chatroomId
        ) {
          state.currentGroupChatroomId = undefined;
          state.currentChatroom = undefined;
        }
        state.groupChatroom[index].messages = message;
        state.groupChatroom[index].restrictedUsers = [];
        if (state.currentChatroom && restriction === Restriction.MUTED)
          state.currentChatroom.restrictedUsers = [];
      }
    },
    unrestrictUser: (state, action: PayloadAction<UserProfileBanLifeType>) => {
      const { id, banLife } = action.payload;

      if (state.role === ROLE.DIERIBA || state.role === ROLE.CHAT_ADMIN) {
        const index = state.restrictedUser.findIndex(
          (user) => user.user.id === id
        );

        if (index !== -1) {
          state.restrictedUser.splice(index, 1)[0];
        }
      }

      const pos = state.regularUser.findIndex((user) => user.user.id === id);

      if (pos !== -1 && !banLife) {
        state.regularUser[pos] = {
          user: { ...action.payload, restrictedGroups: [] },
          role: ROLE.REGULAR_USER,
        };
        return;
      }

      if (!banLife)
        state.regularUser.push({
          user: { ...action.payload, restrictedGroups: [] },
          role: ROLE.REGULAR_USER,
        });
    },
    displayMessage: (
      state,
      action: PayloadAction<{ message: string; chatroomId: string }>
    ) => {
      if (action.payload.chatroomId === state.currentGroupChatroomId) {
        state.message = action.payload.message;
        state.open = true;
      }
    },
    clearMessage: (state) => {
      state.open = false;
    },
    removeUser: (state, action: PayloadAction<BaseChatroomWithUserIdType>) => {
      const { id, chatroomId, role } = action.payload;

      if (chatroomId !== state.currentGroupChatroomId) return;

      if (role === ROLE.CHAT_ADMIN) {
        const index = state.chatAdmin.findIndex((user) => user.user.id === id);

        if (index !== -1) {
          state.chatAdmin.splice(index, 1);
        }
      } else {
        const index = state.regularUser.findIndex(
          (user) => user.user.id === id
        );

        if (index !== -1) {
          state.regularUser.splice(index, 1);
        }
      }

      if (state.role !== ROLE.REGULAR_USER) {
        const index = state.restrictedUser.findIndex(
          (user) => user.user.id === id
        );

        if (index !== -1) {
          state.restrictedUser.splice(index, 1);
        }
      }
    },
    leaveChatroom: (state, action: PayloadAction<BaseChatroomTypeId>) => {
      const { chatroomId } = action.payload;

      const index = state.groupChatroom.findIndex(
        (chatroom) => chatroom.id === chatroomId
      );

      if (index !== -1) {
        state.groupChatroom.splice(index, 1);

        if (state.currentGroupChatroomId !== chatroomId) return;

        state.currentChatroom = undefined;
        state.currentGroupChatroomId = undefined;
        state.role = undefined;
        state.messages = [];
        state.chatAdmin = [];
        state.regularUser = [];
        state.restrictedUser = [];
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
    addJoinableGroup: (state, action: PayloadAction<JoinableChatroomType>) => {
      const index = state.joinableGroup.findIndex(
        (group) => group.id === action.payload.id
      );

      if (index === -1) {
        state.joinableGroup.push(action.payload);
        return;
      }
      state.joinableGroup[index] = action.payload;
    },
    addGroupInvitation: (
      state,
      action: PayloadAction<{ chatroom: BaseChatroomType }>
    ) => {
      if (!state.groupInvitation)
        state.groupInvitation = { groupInvitation: [] };

      const { id } = action.payload.chatroom;
      const index = state.groupInvitation.groupInvitation.findIndex(
        (data) => data.chatroom.id === id
      );

      if (index === -1) {
        state.groupInvitation.groupInvitation.push(action.payload);
        return;
      }
      state.groupInvitation.groupInvitation[index] = action.payload;
    },
    setChatroomMessage: (state, action: PayloadAction<MessageGroupType[]>) => {
      state.messages = action.payload;
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
    deleteGroupInvitation: (state, action: PayloadAction<string>) => {
      const chatroomId = action.payload;
      if (state.groupInvitation)
        state.groupInvitation.groupInvitation =
          state.groupInvitation.groupInvitation.filter(
            (data) => data.chatroom.id !== chatroomId
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

      if (
        message.user.id !== state.myId &&
        (state.blockedUser.findIndex((user) => user.id === message.user.id) >=
          0 ||
          state.blockedBy.findIndex((user) => user.id === message.user.id) >= 0)
      )
        return;

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
  addJoinableGroup,
  setJoinableGroup,
  deleteJoinableGroup,
  removeUser,
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
  restrict,
  unrestrict,
  addNewChatroomUser,
  leaveChatroom,
  previousAdminLeaved,
  displayMessage,
  clearMessage,
  setGroupInvitation,
  addGroupInvitation,
  deleteGroupInvitation,
} = GroupSlice.actions;

export default GroupSlice.reducer;
