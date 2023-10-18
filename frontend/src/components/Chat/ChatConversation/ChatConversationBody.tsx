import { Box, Stack } from "@mui/material";
import { Chat_History } from "../../../data/data";
import TimelineMessage from "../ChatBodyComponents/TimelineMessage";
import TextMessage from "../ChatBodyComponents/TextMessage";
import ImageMessage from "../ChatBodyComponents/ImageMessage";
import ReplyMessage from "../ChatBodyComponents/ReplyMessage";
import DocumentMessage from "../ChatBodyComponents/DocumentMessage";
import StackChatCompo from "../ChatBodyComponents/StackChatCompo";

const ChatConversationBody = () => {
  return (
    <Box
      width="100%"
      sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
      p={3}
    >
      <Stack>
        {Chat_History.map((message, id) => {
          switch (message.type) {
            case "divider":
              return (
                <StackChatCompo
                  children={<TimelineMessage key={id} {...message} />}
                  incoming={message.incoming}
                />
              );
            case "msg":
              switch (message.subtype) {
                case "img":
                  return (
                    <StackChatCompo
                      children={<ImageMessage key={id} {...message} />}
                      incoming={message.incoming}
                    />
                  );
                case "doc":
                  return (
                    <StackChatCompo
                      children={<DocumentMessage key={id} {...message} />}
                      incoming={message.incoming}
                    />
                  );
                case "reply":
                  return (
                    <StackChatCompo
                      children={<ReplyMessage key={id} {...message} />}
                      incoming={message.incoming}
                    />
                  );
                default:
                  return (
                    <StackChatCompo
                      children={<TextMessage key={id} {...message} />}
                      incoming={message.incoming}
                    />
                  );
              }

            default:
              return <></>;
          }
        })}
      </Stack>
    </Box>
  );
};

export default ChatConversationBody;
