import { Box, Stack, Typography } from "@mui/material";
import GroupContact from "./GroupContact";
import GroupConversation from "./GroupConversation";
import { useTheme } from "@mui/material/styles";
import { useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
const GroupDesktopChat = () => {
  const theme = useTheme();

  const { currentGroupChatroomId, groupChatroom } = useAppSelector(
    (state: RootState) => state.groups
  );

  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <GroupContact />
      {!currentGroupChatroomId ? (
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
              {groupChatroom.length === 0
                ? "Join a chatroom or create one!"
                : "Select a group chat !"}
            </Typography>
          </Stack>
        </Box>
      ) : (
        <GroupConversation />
      )}
    </Stack>
  );
};

export default GroupDesktopChat;
