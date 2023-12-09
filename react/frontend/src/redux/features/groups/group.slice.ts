import {
  UpdatedAvatarRes,
  UserUpdateStatusType,
  UserUpdated,
} from "./../../../models/login/UserSchema";
import {
  BaseChatroomType,
  BaseChatroomTypeId,
  BaseChatroomWithUserIdType,
  GroupInvitation,
  InvitedUserType,
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
} from "../../../models/type-enum/typesEnum";
import {
  UserProfileBanLifeType,
  UserWithProfile,
  UserWithProfileFriendsType,
} from "../../../models/ChatContactSchema";
import { AlertColor } from "@mui/material";
import { Basetype } from "../../../models/BaseType";

export interface GroupState {
  invitableUser: InvitedUserType[];
  invitedUser: InvitedUserType[];
  groupInvitation: GroupInvitation[];
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
  blockedUser: Basetype[];
  message: string;
  severity: AlertColor;
  open: boolean;
  numbersOfGroupInvitation: number;
  currentUser: UserWithProfile | undefined;
}

const initialState: GroupState = {
  invitableUser: [],
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
  message: "",
  severity: "success",
  open: false,
  groupInvitation: [],
  invitedUser: [],
  numbersOfGroupInvitation: 0,
  currentUser: undefined,
};

export const GroupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    addBlockedUser: (state, action: PayloadAction<Basetype>) => {
      if (!state.blockedUser.includes(action.payload)) {
        state.blockedUser.push(action.payload);
      }
    },
    removeBlockedUser: (state, action: PayloadAction<string>) => {
      const index = state.blockedUser.findIndex(
        (user) => user.id === action.payload
      );

      if (index !== -1) {
        state.blockedUser.splice(index, 1);
      }
    },
    toggleOpenGroupSidebar: (state) => {
      state.openGroupSidebar = !state.openGroupSidebar;
      state.chatAdmin = [];
      state.regularUser = [];
    },
    setGroupChatroom: (
      state,
      action: PayloadAction<{
        chatrooms: ChatroomGroupType[];
        blockedUser: Basetype[];
        numbersOfGroupInvitation: number;
      }>
    ) => {
      const { chatrooms, blockedUser } = action.payload;
      state.groupChatroom = chatrooms;
      state.blockedUser = blockedUser;
    },
    setJoinableGroup: (
      state,
      action: PayloadAction<JoinableChatroomType[]>
    ) => {
      state.joinableGroup = action.payload;
    },
    setGroupInvitation: (state, action: PayloadAction<GroupInvitation[]>) => {
      state.groupInvitation = action.payload;
    },
    setInvitedUser: (state, action: PayloadAction<InvitedUserType[]>) => {
      state.invitedUser = action.payload;
    },
    setCurrentUser: (
      state,
      action: PayloadAction<{ id: string; role: ChatRoleType }>
    ) => {
      const { id, role } = action.payload;
      if (role === "DIERIBA") {
        const { user } = state.admin as UserGroupType;
        const { id, profile, pong, status, nickname } = user;
        state.currentUser = {
          id,
          profile,
          pong,
          status,
          nickname,
        };
        return;
      }

      if (role === "CHAT_ADMIN") {
        const user = state.chatAdmin.find((user) => user.user.id === id);

        if (user) {
          const {
            user: { id, pong, profile, status, nickname },
          } = user as UserGroupType;

          state.currentUser = {
            id,
            profile,
            pong,
            status,
            nickname,
          };

          return;
        }
      }

      const user = state.regularUser.find((user) => user.user.id === id);

      if (!user) return;

      const {
        user: { pong, profile, status, nickname },
      } = user as UserGroupType;

      state.currentUser = {
        id: (user as UserGroupType).user.id,
        profile,
        pong,
        status,
        nickname,
      };
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
      if (action.payload === state.currentGroupChatroomId) return;

      state.currentGroupChatroomId = action.payload;

      if (action.payload === undefined) return;
      state.currentGroupChatroomId = action.payload;
      state.currentChatroom = state.groupChatroom?.find(
        (chatroom) => chatroom.id === action.payload
      );
    },
    addNewChatroom: (state, action: PayloadAction<ChatroomGroupType>) => {
      state.groupChatroom.unshift(action.payload);
    },
    addNewChatroomUser: (
      state,
      action: PayloadAction<{
        data: UserWithProfileFriendsType;
        chatroomId: string;
      }>
    ) => {
      const { data, chatroomId } = action.payload;
      if (chatroomId !== state.currentGroupChatroomId) return;

      state.regularUser.unshift({
        user: { ...data, restrictedGroups: [] },
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
    setNewAdmin: (
      state,
      action: PayloadAction<{
        data: UserNewRoleResponseType;
        chatroomId: string;
      }>
    ) => {
      const {
        data: { id, role },
        chatroomId,
      } = action.payload;
      if (chatroomId !== state.currentGroupChatroomId) return;

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
    updateUserInfo: (
      state,
      action: PayloadAction<UserUpdated | UpdatedAvatarRes>
    ) => {
      const { id } = action.payload;
      const isNicknameUpdated = "nickname" in action.payload;

      state.messages.forEach((message) => {
        if (message.user.id === id) {
          if (isNicknameUpdated) {
            message.user.nickname = action.payload.nickname;
          } else {
            message.user.profile.avatar = (
              action.payload as UpdatedAvatarRes
            ).avatar;
          }
        }
      });

      if (state.currentUser?.id === id) {
        if (isNicknameUpdated) {
          state.currentUser.nickname = action.payload.nickname;
        } else {
          state.currentUser.profile.avatar = (
            action.payload as UpdatedAvatarRes
          ).avatar;
        }
      }

      if (state.admin?.user.id === id) {
        if (isNicknameUpdated) {
          state.admin.user.nickname = action.payload.nickname;
          return;
        }
        state.admin.user.profile.avatar = (
          action.payload as UpdatedAvatarRes
        ).avatar;
        return;
      }

      let index = state.chatAdmin.findIndex(
        (chatAdmin) => chatAdmin.user.id === id
      );

      if (index !== -1) {
        if (isNicknameUpdated) {
          state.chatAdmin[index].user.nickname = (
            action.payload as UserUpdated
          ).nickname;
          return;
        }
        state.chatAdmin[index].user.profile.avatar = (
          action.payload as UpdatedAvatarRes
        ).avatar;
        return;
      }

      index = state.regularUser.findIndex(
        (regularUser) => regularUser.user.id === id
      );

      if (index !== -1) {
        if (isNicknameUpdated) {
          state.regularUser[index].user.nickname = (
            action.payload as UserUpdated
          ).nickname;
          return;
        }
        state.regularUser[index].user.profile.avatar = (
          action.payload as UpdatedAvatarRes
        ).avatar;
      }
    },
    previousAdminLeaved: (
      state,
      action: PayloadAction<{
        data: PreviousAdminLeaveType;
        chatroomId: string;
      }>
    ) => {
      const {
        data: { newAdminId, newAdminPreviousRole },
        chatroomId,
      } = action.payload;

      if (chatroomId !== state.currentGroupChatroomId) return;

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
    setNewRole: (
      state,
      action: PayloadAction<{
        data: UserNewRoleResponseType;
        chatroomId: string;
      }>
    ) => {
      const {
        data: { id, role },
        chatroomId,
      } = action.payload;

      if (chatroomId !== state.currentGroupChatroomId) return;

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
    addRestrictedUser: (
      state,
      action: PayloadAction<{ data: UserGroupType; chatroomId: string }>
    ) => {
      const { data, chatroomId } = action.payload;
      const {
        role,
        user: { id, restrictedGroups },
      } = data;

      if (chatroomId !== state.currentGroupChatroomId) return;

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
              ...data,
              role: ROLE.REGULAR_USER,
            });
          }
        } else {
          index = state.regularUser.findIndex(
            (regularUser) => regularUser.user.id === id
          );

          if (index !== -1) {
            state.regularUser[index] = {
              ...data,
              role: ROLE.REGULAR_USER,
            };
          }
        }
      }

      if (state.role !== ROLE.REGULAR_USER) {
        state.restrictedUser.push({
          ...data,
          role: ROLE.REGULAR_USER,
        });
      }
    },
    restrict: (state, action: PayloadAction<RestrictedUserResponseType>) => {
      const { chatroomId, ...data } = action.payload;
      if (chatroomId !== state.currentGroupChatroomId) return;

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

      if (chatroomId !== state.currentGroupChatroomId) return;

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
    unrestrictUser: (
      state,
      action: PayloadAction<{
        data: UserProfileBanLifeType;
        chatroomId: string;
      }>
    ) => {
      const { data, chatroomId } = action.payload;

      if (chatroomId !== state.currentGroupChatroomId) return;

      const { id, banLife } = data;

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
          user: { ...data, restrictedGroups: [] },
          role: ROLE.REGULAR_USER,
        };
        return;
      }

      if (!banLife)
        state.regularUser.push({
          user: { ...data, restrictedGroups: [] },
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
    removeUser: (
      state,
      action: PayloadAction<{
        data: BaseChatroomWithUserIdType;
        chatroomId: string;
      }>
    ) => {
      const {
        data: { id, chatroomId, role },
      } = action.payload;

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
      const { id } = action.payload.chatroom;
      const index = state.groupInvitation.findIndex(
        (data) => data.chatroom.id === id
      );

      if (index === -1) {
        state.numbersOfGroupInvitation++;
        state.groupInvitation.push(action.payload);
        return;
      }
      state.groupInvitation[index] = action.payload;
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
    deleteInvitedUser: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.invitedUser = state.invitedUser.filter(
        (data) => data.user.id !== id
      );
    },
    deleteGroupInvitation: (state, action: PayloadAction<string>) => {
      const chatroomId = action.payload;
      const index = state.groupInvitation.findIndex(
        (data) => data.chatroom.id === chatroomId
      );

      if (index !== -1) {
        state.groupInvitation.splice(index, 1);
        state.numbersOfGroupInvitation--;
      }
    },
    updateGroupChatroomListAndMessage: (
      state,
      action: PayloadAction<MessageGroupType>
    ) => {
      const message = action.payload;

      if (
        message.chatroomId !== state.currentGroupChatroomId ||
        state.blockedUser.findIndex((user) => user.id === message.user.id) >= 0
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
    updateUserStatus: (state, action: PayloadAction<UserUpdateStatusType>) => {
      const { ids, status } = action.payload;
      if (state.admin && ids.includes(state.admin.user.id)) {
        state.admin.user.status = status;
        return;
      }
      state.chatAdmin.forEach((chatAdmin) => {
        if (ids.includes(chatAdmin.user.id)) {
          chatAdmin.user.status = status;
        }
      });

      state.regularUser.forEach((regularUser) => {
        if (ids.includes(regularUser.user.id)) {
          regularUser.user.status = status;
        }
      });
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
  updateUserStatus,
  addNewChatroom,
  updateChatroom,
  setGroupMembersAndRole,
  addRestrictedUser,
  setNewAdmin,
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
  setInvitedUser,
  deleteInvitedUser,
  setCurrentUser,
  updateUserInfo,
  addBlockedUser,
  removeBlockedUser,
} = GroupSlice.actions;

export default GroupSlice.reducer;
