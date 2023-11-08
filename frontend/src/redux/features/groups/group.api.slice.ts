import { MessageFormType } from "./../../../models/ChatContactSchema";
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
import { ChatroomGroupType } from "../../../models/groupChat";

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
    getAllGroup: builder.query<
      BaseServerResponse & { data: ChatroomGroupType[] },
      void
    >({
      query: () => ({ url: "chat/get-all-group-chatroom" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateGroupMutation,
  useSendGroupMessageMutation,
  useGetAllGroupQuery,
} = GroupApiSlice;
