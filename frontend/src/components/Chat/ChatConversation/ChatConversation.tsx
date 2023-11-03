import { Box, Stack } from "@mui/material";
import ChatConversationHeader from "./ChatConversationHeader";
import ChatConversationBody from "./ChatConversationBody";
import ChatConversationFooter from "./ChatConversationFooter";
import { useTheme } from "@mui/material/styles";
import { useAppSelector } from "../../../redux/hooks";
import ChatComp from "./ChatComp";

const  ChatConversation = () => {
  const theme = useTheme();

  const { open } = useAppSelector((state) => state.sidebar);

  return (
    <>
      <Box
        sx={{
          height: "100%",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background.paper,
          width: open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
        }}
      >
        <Stack height="100%" maxHeight="100vh" width="auto">
          <ChatConversationHeader />
          <ChatConversationBody />
          <ChatConversationFooter />
        </Stack>
      </Box>
      <ChatComp />
    </>
  );
};

export default ChatConversation;
