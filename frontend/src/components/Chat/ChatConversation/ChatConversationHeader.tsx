import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CaretDown } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import StyledBadge from "../../Badge/StyledBadge";
import { toggle } from "../../../redux/features/sidebar.slices";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { PrivateChatroomType } from "../../../models/ChatContactSchema";

const ChatConversationHeader = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const chatroomInfo = useAppSelector(
    (state: RootState) => state.chat.currentChatroom as PrivateChatroomType
  );

  const {
    user: { nickname, status, profile },
  } = chatroomInfo.users[0];
  return (
    <>
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
        height="70px"
      >
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          sx={{ width: "100%", height: "100%" }}
        >
          <Stack direction="row" spacing={2}>
            <div onClick={() => dispatch(toggle())}>
              <Box>
                {status === "ONLINE" ? (
                  <StyledBadge
                    sx={{ cursor: "pointer" }}
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar src={profile?.avatar} alt={profile?.avatar} />
                  </StyledBadge>
                ) : (
                  <>
                    <Avatar
                      sx={{ cursor: "pointer" }}
                      src={profile?.avatar}
                      alt={profile?.avatar}
                    />
                  </>
                )}
              </Box>
            </div>

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
      <Divider />
    </>
  );
};

export default ChatConversationHeader;
