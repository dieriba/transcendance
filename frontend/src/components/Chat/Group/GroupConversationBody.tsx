import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
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
  clearMessage,
  displayMessage,
  previousAdminLeaved,
  removeUser,
  setChatroomMessage,
  setNewAdmin,
  setNewRole,
} from "../../../redux/features/groups/group.slice";
import {
  SocketServerErrorResponse,
  SocketServerSucessWithChatroomId,
} from "../../../services/type";
import { connectSocket, socket } from "../../../utils/getSocket";
import { ChatEventGroup } from "../../../../../shared/socket.event";
import { UserWithProfileFriendsType } from "../../../models/ChatContactSchema";
import TextMessage from "../TextMessage";
import CustomNotificationBar from "../../snackbar/customNotificationBar";
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
          data: SocketServerSucessWithChatroomId & {
            data: PreviousAdminLeaveType;
          }
        ) => {
          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
          dispatch(previousAdminLeaved(data.data));
        }
      );

      socket.on(
        ChatEventGroup.NEW_ADMIN,
        (
          data: SocketServerSucessWithChatroomId & {
            data: UserNewRoleResponseType;
          }
        ) => {
          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
          dispatch(setNewAdmin(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_LEAVED,
        (
          data: SocketServerSucessWithChatroomId & {
            data: BaseChatroomWithUserIdType;
          }
        ) => {
          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
          dispatch(removeUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_ROLE_CHANGED,
        (
          data: SocketServerSucessWithChatroomId & {
            data: UserNewRoleResponseType;
          }
        ) => {
          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
          dispatch(setNewRole(data.data));
        }
      );
      socket.on(
        ChatEventGroup.USER_RESTRICTED,
        (
          data: SocketServerSucessWithChatroomId & {
            data: UserGroupType;
          }
        ) => {
          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
          dispatch(addRestrictedUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_KICKED,
        (
          data: SocketServerSucessWithChatroomId & {
            data: BaseChatroomWithUserIdType;
          }
        ) => {
          console.log({ data });

          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
          dispatch(removeUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.NEW_USER_CHATROOM,
        (
          data: SocketServerSucessWithChatroomId & {
            data: UserWithProfileFriendsType;
          }
        ) => {
          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
          dispatch(addNewChatroomUser(data.data));
        }
      );

      socket.on(
        ChatEventGroup.USER_ADDED,
        (
          data: SocketServerSucessWithChatroomId & {
            data: UserWithProfileFriendsType;
          }
        ) => {
          dispatch(
            displayMessage({
              message: data.message,
              chatroomId: data.chatroomId,
            })
          );
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
  const { messages, open, message } = useAppSelector(
    (state: RootState) => state.groups
  );

  const onClose = () => {
    dispatch(clearMessage());
  };

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
        <CustomNotificationBar
          onClose={onClose}
          open={open}
          message={message}
        />
        <Stack height={"100%"}>
          {messages.map(({ id, user, content }) => {
            const incoming = myId === user.id;

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
          })}
          <div ref={lastMessage}></div>
        </Stack>
      </Box>
    );
  }
};

export default GroupConversationBody;
