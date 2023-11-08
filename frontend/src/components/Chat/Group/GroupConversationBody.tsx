import { Box, Stack } from "@mui/material";
import TextMessage from "../ChatBodyComponents/TextMessage";
import ImageMessage from "../ChatBodyComponents/ImageMessage";
import ReplyMessage from "../ChatBodyComponents/ReplyMessage";
import DocumentMessage from "../ChatBodyComponents/DocumentMessage";
import StackChatCompo from "../ChatBodyComponents/StackChatCompo";
import { useAppSelector } from "../../../redux/hooks";

export interface GroupConversationBodyProps {
  id: string;
  incoming: boolean;
  content: string;
}

const GroupConversationBody = () => {
  const chatroomInfo = useAppSelector((state) => state.groups.currentChatroom);
  const myId = useAppSelector((state) => state.user.user?.id);

  const messages = chatroomInfo?.messages;
  console.log({ chatroomInfo });

  return (
    <Box
      width="100%"
      sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
      p={3}
    >
      <Stack>
        {messages?.map(({ id, messageTypes, user, content }) => {
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
                <StackChatCompo
                  key={id}
                  children={
                    <TextMessage
                      nickname={user.nickname}
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
};

export default GroupConversationBody;
