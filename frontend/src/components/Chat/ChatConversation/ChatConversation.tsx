import { Box, Stack } from "@mui/material";
import ChatConversationHeader from "./ChatConversationHeader";
import ChatConversationBody from "./ChatConversationBody";
import ChatConversationFooter from "./ChatConversationFooter";
import { useTheme } from "@mui/material/styles";

const ChatConversation = () => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          height: "100%",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background.paper,
          width: "100%",
        }}
      >
        <Stack height="100%" width="auto">
          <ChatConversationHeader />
          <ChatConversationBody />
          <ChatConversationFooter />
        </Stack>
      </Box>
    </>
  );
};

export default ChatConversation;
