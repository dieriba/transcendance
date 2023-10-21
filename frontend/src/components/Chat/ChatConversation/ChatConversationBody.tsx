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
                  key={id}
                  children={<TimelineMessage {...message} />}
                  incoming={message.incoming}
                />
              );
            case "msg":
              switch (message.subtype) {
                case "img":
                  return (
                    <StackChatCompo
                      key={id}
                      children={<ImageMessage {...message} />}
                      incoming={message.incoming}
                    />
                  );
                case "doc":
                  return (
                    <StackChatCompo
                      key={id}
                      children={<DocumentMessage {...message} />}
                      incoming={message.incoming}
                    />
                  );
                case "reply":
                  return (
                    <StackChatCompo
                      key={id}
                      children={<ReplyMessage {...message} />}
                      incoming={message.incoming}
                    />
                  );
                default:
                  return (
                    <StackChatCompo
                      key={id}
                      children={<TextMessage {...message} />}
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
