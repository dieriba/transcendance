import { Avatar, Box, IconButton, Stack, Typography } from "@mui/material";
import { CaretDown } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import StyledBadge from "../../Badge/StyledBadge";
import { toggle } from "../../../redux/features/sidebar.slices";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

const ChatConversationHeader = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const chatroomInfo = useAppSelector((state) => state.chat.currentChatroom);
  const {
    user: {
      nickname,
      status,
      profile: { avatar },
    },
  } = chatroomInfo.users[0];
  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25",
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack direction="row" spacing={2}>
          <Box>
            <StyledBadge
              sx={{ cursor: "pointer" }}
              onClick={() => dispatch(toggle())}
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar src={avatar} alt={avatar} />
            </StyledBadge>
          </Box>
          <Stack>
            <Typography variant="subtitle2">{nickname}</Typography>
            {status === "ONLINE" ? (
              <Typography variant="subtitle2">Online</Typography>
            ) : (
              <Typography variant="subtitle2">Offline</Typography>
            )}
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton>
            <CaretDown />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatConversationHeader;
