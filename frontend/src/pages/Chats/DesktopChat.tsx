import { Box, Stack, Typography } from "@mui/material";
import ChatContact from "../../components/Chat/ChatContact";
import ChatConversation from "../../components/Chat/ChatConversation/ChatConversation";
import { useTheme } from "@mui/material/styles";
import { RootState } from "../../redux/store";
import { useAppSelector } from "../../redux/hooks";

const DesktopChat = () => {
  const theme = useTheme();
  const { privateChatroom, currentPrivateChatroomId } = useAppSelector(
    (state: RootState) => state.chat
  );
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <ChatContact />
      {!currentPrivateChatroomId ? (
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
          <Stack
            width="100%"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography>
              {privateChatroom.length === 0
                ? "No conversation started yet!"
                : "Select a conversation !"}
            </Typography>
          </Stack>
        </Box>
      ) : (
        <>
          <ChatConversation />
        </>
      )}
    </Stack>
  );
};

export default DesktopChat;
