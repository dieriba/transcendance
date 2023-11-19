import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ImageMessage from "../ChatBodyComponents/ImageMessage";
import ReplyMessage from "../ChatBodyComponents/ReplyMessage";
import DocumentMessage from "../ChatBodyComponents/DocumentMessage";
import StackChatCompo from "../StackChatCompo";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useEffect, useRef } from "react";

import { useGetAllGroupMessagesQuery } from "../../../redux/features/groups/group.api.slice";
import { RootState } from "../../../redux/store";
import {
  BaseChatroomWithUserIdType,
  PreviousAdminLeaveType,
  UserGroupType,
  UserNewRoleResponseType,
} from "../../../models/groupChat";
import {
  addNewChatroomUser,
  addRestrictedUser,
  previousAdminLeaved,
  removeUser,
  setChatroomMessage,
  setNewAdmin,
  setNewRole,
} from "../../../redux/features/groups/group.slice";
import {
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { connectSocket, socket } from "../../../utils/getSocket";
import { ChatEventGroup } from "../../../../../shared/socket.event";
import { UserWithProfileFriendsType } from "../../../models/ChatContactSchema";
import TextMessage from "../ChatBodyComponents/TextMessage";
export interface GroupConversationBodyProps {
  id: string;
  incoming: boolean;
  content: string;
}

const GroupConversationBody = () => {
  const myId = useAppSelector((state: RootState) => state.user.user?.id);
  const lastMessage = useRef<HTMLDivElement>(null);
  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  ) as string;
  const { data, isLoading, isError, error } = useGetAllGroupMessagesQuery(
    {
      chatroomId,
    },
    { refetchOnMountOrArgChange: true }
  );

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (data?.data) {
      connectSocket();

      dispatch(setChatroomMessage(data.data));

      socket.on(
        ChatEventGroup.PREVIOUS_ADMIN_LEAVED,
        (
          data: SocketServerSucessResponse & { data: PreviousAdminLeaveType }
        ) => {
          dispatch(previousAdminLeaved(data.data));
        }
      );

      socket.on(
        ChatEventGroup.NEW_ADMIN,
        (
          data: SocketServerSucessResponse & { data: UserNewRoleResponseType }
        ) => {
          dispatch(setNewAdmin(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_LEAVED,
        (
          data: SocketServerSucessResponse & {
            data: BaseChatroomWithUserIdType;
          }
        ) => {
          dispatch(removeUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_ROLE_CHANGED,
        (data: { data: UserNewRoleResponseType }) => {
          dispatch(setNewRole(data.data));
        }
      );
      socket.on(
        ChatEventGroup.USER_RESTRICTED,
        (
          data: SocketServerSucessResponse & {
            data: UserGroupType;
          }
        ) => {
          dispatch(addRestrictedUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_KICKED,
        (
          data: SocketServerSucessResponse & {
            data: BaseChatroomWithUserIdType;
          }
        ) => {
          dispatch(removeUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.NEW_USER_CHATROOM,
        (
          data: SocketServerSucessResponse & {
            data: UserWithProfileFriendsType;
          }
        ) => {
          console.log({ data });

          dispatch(addNewChatroomUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_ADDED,
        (
          data: SocketServerSucessResponse & {
            data: UserWithProfileFriendsType;
          }
        ) => {
          console.log({ data: data.data });

          dispatch(addNewChatroomUser(data.data));
        }
      );

      return () => {
        socket.off(ChatEventGroup.USER_ADDED);
        socket.off(ChatEventGroup.NEW_USER_CHATROOM);
        socket.off(ChatEventGroup.USER_KICKED);
        socket.off(ChatEventGroup.USER_RESTRICTED);
        socket.off(ChatEventGroup.USER_LEAVED);
        socket.off(ChatEventGroup.NEW_ADMIN);
        socket.off(ChatEventGroup.USER_ROLE_CHANGED);
        socket.off(ChatEventGroup.PREVIOUS_ADMIN_LEAVED);
      };
    }
  }, [data, dispatch]);
  const messages = useAppSelector((state: RootState) => state.groups.messages);

  useEffect(() => {
    lastMessage.current?.scrollIntoView();
  }, [messages]);

  if (isLoading) {
    return (
      <Box
        width="100%"
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
        p={3}
      >
        <Stack
          p={3}
          sx={{ width: "100%" }}
          alignItems="center"
          height="100%"
          justifyContent="center"
        >
          <CircularProgress />
        </Stack>
      </Box>
    );
  } else if (isError || !data) {
    return (
      <Box
        width="100%"
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
        p={3}
      >
        <Stack alignItems="center" height="100%" justifyContent="center">
          <Typography>
            {(error as SocketServerErrorResponse).message}
          </Typography>
          <Button variant="contained" color="inherit">
            Leave Group?
          </Button>
        </Stack>
      </Box>
    );
  } else {
    return (
      <Box
        width="100%"
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
        p={3}
      >
        <Stack>
          {messages.map(({ id, messageTypes, user, content }) => {
            const incoming = myId === user.id;

            switch (messageTypes) {
              case "IMAGE":
                return (
                  <StackChatCompo
                    key={id}
                    incoming={incoming}
                    children={
                      <ImageMessage
                        incoming={incoming}
                        id={id}
                        content={content}
                        image={content}
                      />
                    }
                  />
                );
              case "DOCUMENT":
                return (
                  <StackChatCompo
                    incoming={incoming}
                    key={id}
                    children={
                      <DocumentMessage
                        incoming={incoming}
                        id={id}
                        content={content}
                      />
                    }
                  />
                );
              case "REPLY":
                return (
                  <StackChatCompo
                    incoming={incoming}
                    key={id}
                    children={
                      <ReplyMessage
                        id={id}
                        content={content}
                        incoming={incoming}
                        reply={content}
                      />
                    }
                  />
                );
              default:
                return (
                  <StackChatCompo
                    incoming={incoming}
                    key={id}
                    children={
                      <TextMessage
                        nickname={user.nickname}
                        id={id}
                        content={content}
                        incoming={incoming}
                        avatar={
                          user.profile?.avatar ? user.profile.avatar : undefined
                        }
                      />
                    }
                  />
                );
            }
          })}
          <div ref={lastMessage}></div>
        </Stack>
      </Box>
    );
  }
};

export default GroupConversationBody;
