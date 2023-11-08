import { Box, Stack } from "@mui/material";
import GroupConversationHeader from "./GroupConversationHeader";
import GroupConversationBody from "./GroupConversationBody";
import GroupConversationFooter from "./GroupConversationFooter";
import { useTheme } from "@mui/material/styles";

const GroupConversation = () => {
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
          width: "calc(100vw - 420px)",
        }}
      >
        <Stack height="100%" maxHeight="100vh" width="auto">
          <GroupConversationHeader />
          <GroupConversationBody />
          <GroupConversationFooter />
        </Stack>
      </Box>
    </>
  );
};

export default GroupConversation;
