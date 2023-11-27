import {
  AddNewUserToGroupType,
  BaseChatroomTypeId,
  BaseChatroomWithUserIdType,
  GroupInvitation,
  InviteUserToGroupType,
  InvitedUserType,
  RestrictUserType,
  SetNewRoleType,
  UserGroupType,
  UserNewRoleResponseType,
} from "./../../../models/groupChat";
import {
  MessageFormType,
  UserProfileBanLifeType,
} from "./../../../models/ChatContactSchema";
import {
  BaseServerResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { apiSlice } from "../../api/apiSlice";
import {
  ChatEventGroup,
  GeneralEvent,
} from "./../../../../../shared/socket.event";

import { connectSocket, socket } from "../../../utils/getSocket";
import { CreateGroupFormType } from "../../../models/CreateGroupSchema";
import {
  ChatroomGroupType,
  GroupMembertype,
  JoinProtectedGroupFormType,
  JoinableChatroomType,
  MessageGroupType,
} from "../../../models/groupChat";
import {
  EditGroupType,
  editGroupResponseType,
} from "../../../models/EditGroupSchema";
import { BaseUserTypeId } from "../../../models/login/UserSchema";

export const GroupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createGroup: builder.mutation<
      SocketServerSucessResponse,
      CreateGroupFormType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.CREATE_GROUP_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    editGroup: builder.mutation<
      SocketServerSucessResponse & { data: editGroupResponseType },
      EditGroupType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.EDIT_GROUP_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    sendGroupMessage: builder.mutation<
      SocketServerSucessResponse,
      MessageFormType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.SEND_GROUP_MESSAGE, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    joinGroup: builder.mutation<
      SocketServerSucessResponse & { data: ChatroomGroupType },
      { chatroomId: string } & Partial<JoinProtectedGroupFormType>
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.JOIN_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    acceptGroupInvitaion: builder.mutation<
      SocketServerSucessResponse & { data: ChatroomGroupType },
      { chatroomId: string }
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.JOIN_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    setNewDieriba: builder.mutation<
      SocketServerSucessResponse & { data: UserNewRoleResponseType },
      SetNewRoleType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.SET_DIERIBA, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    setNewRole: builder.mutation<
      SocketServerSucessResponse & { data: UserNewRoleResponseType },
      SetNewRoleType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.CHANGE_USER_ROLE, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    restrictUser: builder.mutation<
      SocketServerSucessResponse & { data: UserGroupType },
      RestrictUserType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.RESTRICT_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    unrestrictUser: builder.mutation<
      SocketServerSucessResponse & { data: UserProfileBanLifeType },
      BaseChatroomWithUserIdType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.UNRESTRICT_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    kickUser: builder.mutation<
      SocketServerSucessResponse & { data: BaseChatroomWithUserIdType },
      BaseChatroomWithUserIdType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.KICK_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    addUser: builder.mutation<
      SocketServerSucessResponse & { data: unknown },
      AddNewUserToGroupType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.ADD_FRIEND_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    inviteUser: builder.mutation<
      SocketServerSucessResponse & { data: unknown },
      InviteUserToGroupType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.ADD_INVITE_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    leaveGroup: builder.mutation<
      SocketServerSucessResponse & { data: BaseChatroomWithUserIdType },
      BaseChatroomTypeId
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.LEAVE_GROUP, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    deleteGroup: builder.mutation<
      SocketServerSucessResponse & { data: BaseChatroomTypeId },
      BaseChatroomTypeId
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.DELETE_GROUP_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    cancelGroupInvitation: builder.mutation<
      SocketServerSucessResponse & { data: unknown },
      BaseChatroomWithUserIdType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.CANCEL_USER_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    declineGroupInvitation: builder.mutation<
      SocketServerSucessResponse & { data: unknown },
      BaseChatroomTypeId
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.DECLINE_GROUP_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getAllGroup: builder.query<
      SocketServerSucessResponse & {
        data: {
          chatrooms: ChatroomGroupType[];
          blockedUser: BaseUserTypeId[];
          blockedBy: BaseUserTypeId[];
        };
      },
      void
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.REQUEST_ALL_CHATROOM, data);

          socket.on(ChatEventGroup.GET_ALL_CHATROOM, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getAllGroupMessages: builder.query<
      SocketServerSucessResponse & { data: MessageGroupType[] },
      { chatroomId: string }
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(ChatEventGroup.REQUEST_ALL_CHATROOM_MESSAGE, data);

          socket.on(ChatEventGroup.GET_ALL_CHATROOM_MESSAGE, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    getAllJoinableGroup: builder.query<
      BaseServerResponse & { data: JoinableChatroomType[] },
      void
    >({ query: () => ({ url: "chat/get-all-joinable-chatroom" }) }),
    getAllGroupInvitation: builder.query<
      BaseServerResponse & { data: GroupInvitation[] },
      void
    >({ query: () => ({ url: "chat/get-all-group-invitation" }) }),
    getAllInvitedUser: builder.query<
      BaseServerResponse & { data: InvitedUserType },
      string
    >({
      query: (chatroomId) => ({
        url: `chat/get-all-invited-users?chatroomId=${chatroomId}`,
      }),
    }),
    getAllGroupUser: builder.query<
      BaseServerResponse & { data: GroupMembertype },
      string
    >({
      query: (chatroomId) => ({
        url: `chat/get-all-user-chatroom?chatroomId=${chatroomId}`,
      }),
    }),
    getAllRestrictedUser: builder.query<
      BaseServerResponse & { data: UserGroupType[] },
      string
    >({
      query: (chatroomId) => ({
        url: `chat/get-all-restricted-user?chatroomId=${chatroomId}`,
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useCreateGroupMutation,
  useSendGroupMessageMutation,
  useGetAllGroupMessagesQuery,
  useGetAllRestrictedUserQuery,
  useGetAllGroupQuery,
  useGetAllJoinableGroupQuery,
  useJoinGroupMutation,
  useGetAllGroupUserQuery,
  useLeaveGroupMutation,
  useKickUserMutation,
  useRestrictUserMutation,
  useEditGroupMutation,
  useUnrestrictUserMutation,
  useSetNewDieribaMutation,
  useSetNewRoleMutation,
  useDeleteGroupMutation,
  useAddUserMutation,
  useInviteUserMutation,
  useGetAllGroupInvitationQuery,
  useAcceptGroupInvitaionMutation,
  useCancelGroupInvitationMutation,
  useGetAllInvitedUserQuery,
  useDeclineGroupInvitationMutation,
} = GroupApiSlice;
