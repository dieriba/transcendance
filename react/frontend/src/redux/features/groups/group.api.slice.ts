import {
  AddNewUserToGroupType,
  BaseChatroomTypeId,
  BaseChatroomWithUserIdType,
  GroupInvitation,
  InviteUserToGroupType,
  InvitedUserType,
  RestrictUserType,
  RestrictedGroupType,
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
import { ChatEventGroup, GeneralEvent } from "../../../../shared/socket.event";

import { clearSocket, connectSocket, socket } from "../../../utils/getSocket";
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
import { Basetype } from "../../../models/BaseType";

export const GroupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createGroup: builder.mutation<
      SocketServerSucessResponse,
      CreateGroupFormType
    >({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.CREATE_GROUP_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.EDIT_GROUP_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.SEND_GROUP_MESSAGE, data);

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.JOIN_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.JOIN_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.SET_DIERIBA, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.CHANGE_USER_ROLE, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.RESTRICT_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.UNRESTRICT_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.KICK_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.ADD_FRIEND_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.ADD_INVITE_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.LEAVE_GROUP, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.DELETE_GROUP_CHATROOM, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.CANCEL_USER_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.DECLINE_GROUP_INVITATION, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    getAllGroup: builder.query<
      SocketServerSucessResponse & {
        data: {
          chatrooms: ChatroomGroupType[];
          blockedUser: Basetype[];
          numbersOfGroupInvitation: number;
        };
      },
      void
    >({
      queryFn: () => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.REQUEST_ALL_CHATROOM);

          socket.on(ChatEventGroup.GET_ALL_CHATROOM, (data) => {
            clearSocket([
              GeneralEvent.EXCEPTION,
              ChatEventGroup.GET_ALL_CHATROOM,
            ]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([
              GeneralEvent.EXCEPTION,
              ChatEventGroup.GET_ALL_CHATROOM,
            ]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(ChatEventGroup.REQUEST_ALL_CHATROOM_MESSAGE, data);

          socket.on(ChatEventGroup.GET_ALL_CHATROOM_MESSAGE, (data) => {
            clearSocket([
              GeneralEvent.EXCEPTION,
              ChatEventGroup.GET_ALL_CHATROOM_MESSAGE,
            ]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([
              GeneralEvent.EXCEPTION,
              ChatEventGroup.GET_ALL_CHATROOM_MESSAGE,
            ]);
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
      BaseServerResponse & { data: InvitedUserType[] },
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
    getRestrictionInfo: builder.mutation<
      BaseServerResponse & { data: RestrictedGroupType },
      BaseChatroomWithUserIdType
    >({
      query: (data) => ({
        url: "chat/get-restriction-detail",
        body: data,
        method: "POST",
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
  useGetRestrictionInfoMutation,
} = GroupApiSlice;
