import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import TextMessage from "../ChatBodyComponents/TextMessage";
import ImageMessage from "../ChatBodyComponents/ImageMessage";
import ReplyMessage from "../ChatBodyComponents/ReplyMessage";
import DocumentMessage from "../ChatBodyComponents/DocumentMessage";
import StackChatCompo from "../ChatBodyComponents/StackChatCompo";
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
        </Stack>
      </Box>
    );
  } else {
    console.log({ messages });

    return (
      <Box
        width="100%"
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
        p={3}
      >
        <Stack>
          {messages?.map(({ id, messageTypes, userId, content, user }) => {
            const incoming = myId === userId ? false : true;
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
                  />
                );
              default:
                return (
                  <StackChatCompo
                    key={id}
                    children={
                      <TextMessage
                        nickname={user.nickname}
                        avatar={user.profile?.avatar ? user.profile?.avatar : undefined}
                        id={id}
                        content={content}
                        incoming={myId === id}
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

export default ChatConversationBody;
