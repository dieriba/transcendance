import { Box, Stack } from "@mui/material";
import { Theme } from "@mui/material/styles";
import ChatConversationHeader from "./ChatConversationHeader";
import ChatConversationBody from "./ChatConversationBody";
import ChatConversationFooter from "./ChatConversationFooter";

export interface ChatConversationProps {
  theme: Theme;
}
const ChatConversation = ({ theme }: ChatConversationProps) => {
  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.default,
        width: "calc(100vw - 420px)",
      }}
    >
      <Stack height="100%" maxHeight="100vh" width="auto">
        <ChatConversationHeader theme={theme}/>
        <ChatConversationBody />
        <ChatConversationFooter theme={theme} />
      </Stack>
    </Box>
  );
};

export default ChatConversation;
