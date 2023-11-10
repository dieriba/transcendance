import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import ImageMessage from "../ChatBodyComponents/ImageMessage";
import ReplyMessage from "../ChatBodyComponents/ReplyMessage";
import DocumentMessage from "../ChatBodyComponents/DocumentMessage";
import StackChatCompo from "../ChatBodyComponents/StackChatCompo";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useEffect } from "react";
import { connectSocket, socket } from "../../../utils/getSocket";
import { ChatEventGroup } from "../../../../../shared/socket.event";
import { useGetAllGroupMessagesQuery } from "../../../redux/features/groups/group.api.slice";
import { RootState } from "../../../redux/store";
import { ChatroomGroupType, MessageGroupType } from "../../../models/groupChat";
import {
  setChatroomMessage,
  updateGroupChatroomListAndMessage,
} from "../../../redux/features/groups/groupSlice";
import { SocketServerSucessResponse } from "../../../services/type";
import TextMessage from "./TextMessageGroup";
export interface GroupConversationBodyProps {
  id: string;
  incoming: boolean;
  content: string;
}

const GroupConversationBody = () => {
  const myId = useAppSelector((state: RootState) => state.user.user?.id);
  const chatroom = useAppSelector(
    (state: RootState) => state.groups.currentChatroom
  ) as ChatroomGroupType;
  const { data, isLoading, isError } = useGetAllGroupMessagesQuery(
    {
      chatroomId: chatroom.id,
    },
    { refetchOnMountOrArgChange: true }
  );

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (data?.data) {
      dispatch(setChatroomMessage(data.data));
      connectSocket();
      socket.on(
        ChatEventGroup.RECEIVE_GROUP_MESSAGE,
        (data: SocketServerSucessResponse & { data: MessageGroupType }) => {
          dispatch(updateGroupChatroomListAndMessage(data.data));
        }
      );
      return () => {
        socket.off(ChatEventGroup.RECEIVE_GROUP_MESSAGE);
      };
    }
  }, [data, dispatch]);
  const messages = useAppSelector((state: RootState) => state.groups.messages);
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
          <Typography>An error has occured</Typography>
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
            const incoming = myId === user.id ? false : true;
            switch (messageTypes) {
              case "IMAGE":
                return (
                  <StackChatCompo
                    key={id}
                    children={
                      <ImageMessage
                        incoming={incoming}
                        id={id}
                        content={content}
                        image={content}
                      />
                    }
                    incoming={incoming}
                  />
                );
              case "DOCUMENT":
                return (
                  <StackChatCompo
                    key={id}
                    children={
                      <DocumentMessage
                        incoming={incoming}
                        id={id}
                        content={content}
                      />
                    }
                    incoming={incoming}
                  />
                );
              case "REPLY":
                return (
                  <StackChatCompo
                    key={id}
                    children={
                      <ReplyMessage
                        id={id}
                        content={content}
                        incoming={myId === id}
                        reply={content}
                      />
                    }
                    incoming={incoming}
                  />
                );
              default:
                return (
                  <Stack key={id} direction="row" mb={1} justifyContent={"start"}>
                    <TextMessage
                      nickname={user.nickname}
                      id={id}
                      content={content}
                      incoming={myId === id}
                      avatar={user.profile.avatar}
                    />
                  </Stack>
                );
            }
          })}
        </Stack>
      </Box>
    );
  }
};

export default GroupConversationBody;
