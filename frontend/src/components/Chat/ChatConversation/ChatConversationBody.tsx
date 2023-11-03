import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import TextMessage from "../ChatBodyComponents/TextMessage";
import ImageMessage from "../ChatBodyComponents/ImageMessage";
import ReplyMessage from "../ChatBodyComponents/ReplyMessage";
import DocumentMessage from "../ChatBodyComponents/DocumentMessage";
import StackChatCompo from "../ChatBodyComponents/StackChatCompo";
import { useAppSelector } from "../../../redux/hooks";
import { useGetCurrentChatMessageQuery } from "../../../redux/features/chat/chats.api.slice";

export interface ChatConversationBodyProps {
  id: string;
  incoming: boolean;
  content: string;
}

const ChatConversationBody = () => {
  const chatroomInfo = useAppSelector((state) => state.chat.currentChatroom);
  const myId = useAppSelector((state) => state.user.user?.id);
  const { data, isLoading, isError } = useGetCurrentChatMessageQuery(
    chatroomInfo.id
  );

  if (isLoading) {
    return (
      <Box
        width="100%"
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
        p={3}
      >
        <Stack p={3} sx={{ width: "100%" }} justifyContent="center">
          <CircularProgress />
        </Stack>
      </Box>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>
          An error has occured while trying to retrieve chat message
        </Typography>
      </Stack>
    );
  } else {
    const messages = data.data;
    console.log(messages);

    return (
      <Box
        width="100%"
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
        p={3}
      >
        <Stack>
          {messages.map(({ id, messageTypes, userId, content }) => {
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
                  <StackChatCompo
                    key={id}
                    children={
                      <TextMessage
                        id={id}
                        content={content}
                        incoming={myId === id}
                      />
                    }
                    incoming={incoming}
                  />
                );
            }
          })}
        </Stack>
      </Box>
    );
  }
};

export default ChatConversationBody;
