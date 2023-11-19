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
import { useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { PrivateChatroomType } from "../../../models/ChatContactSchema";
import { STATUS } from "../../../models/type-enum/typesEnum";
import ChatContactInfo from "../ChatContactInfo";
import { useState } from "react";

const ChatConversationHeader = () => {
  const theme = useTheme();

  const chatroomInfo = useAppSelector(
    (state: RootState) => state.chat.currentChatroom as PrivateChatroomType
  );
  const [open, setOpen] = useState(false);
  const {
    user: {
      nickname,
      status,
      profile: { avatar },
    },
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
            <div onClick={() => setOpen(true)}>
              <Box>
                {status === STATUS.ONLINE ? (
                  <StyledBadge
                    sx={{ cursor: "pointer" }}
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar
                      sx={{ width: "50px", height: "50px" }}
                      src={avatar ? avatar : undefined}
                      alt={avatar ? avatar : undefined}
                    />
                  </StyledBadge>
                ) : (
                  <>
                    <Avatar
                      sx={{ cursor: "pointer", width: "50px", height: "50px" }}
                      src={avatar ? avatar : undefined}
                      alt={avatar ? avatar : undefined}
                    />
                  </>
                )}
              </Box>
            </div>

            <Stack justifyContent={"center"}>
              <Typography variant="subtitle2">{nickname}</Typography>
              {status === STATUS.ONLINE ? (
                <Typography variant="subtitle2">Online</Typography>
              ) : (
                <Typography variant="subtitle2">Offline</Typography>
              )}
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => setOpen(true)}>
              <CaretDown />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
      <Divider />
      {open && (
        <ChatContactInfo
          openDialog={open}
          handleClose={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
};

export default ChatConversationHeader;
