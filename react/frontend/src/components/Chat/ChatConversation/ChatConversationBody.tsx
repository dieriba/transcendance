import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import TextMessage from "../TextMessage";
import StackChatCompo from "../StackChatCompo";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { useGetAllChatroomMessageQuery } from "../../../redux/features/chat/chats.api.slice";
import { useEffect, useRef } from "react";
import { setChatroomMessage } from "../../../redux/features/chat/chat.slice";
import { SocketServerErrorResponse } from "../../../services/type";

export interface ChatConversationBodyProps {
  id: string;
  incoming: boolean;
  content: string;
}

const ChatConversationBody = () => {
  const myId = useAppSelector((state: RootState) => state.user.user?.id);
  const lastMessage = useRef<HTMLDivElement>(null);

  const chatroomId = useAppSelector(
    (state: RootState) => state.chat.currentPrivateChatroomId
  ) as string;
  const messages = useAppSelector((state: RootState) => state.chat.messages);
  const { data, isLoading, isError, error } = useGetAllChatroomMessageQuery(
    {
      chatroomId,
    },
    { refetchOnMountOrArgChange: true }
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data?.data) {
      dispatch(setChatroomMessage(data.data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    lastMessage.current?.scrollIntoView();
  }, [messages]);

  if (isLoading) {
    return (
      <Box width="100%" sx={{ height: "100%", overflowY: "scroll" }} p={3}>
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
        </Stack>
      </Box>
    );
  } else {
    return (
      <Box width="100%" sx={{ height: "100vh", overflowY: "scroll" }} p={3}>
        <Stack>
          {messages?.map(({ id, content, user }) => {
            const incoming = myId === user.id;
            return (
              <StackChatCompo
                key={id}
                incoming={incoming}
                children={
                  <TextMessage
                    nickname={user.nickname}
                    avatar={
                      user.profile?.avatar ? user.profile?.avatar : undefined
                    }
                    id={id}
                    content={content}
                    incoming={incoming}
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

export default ChatConversationBody;
