import {
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { CaretLeft } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { PrivateChatroomType } from "../../../models/ChatContactSchema";
import { STATUS } from "../../../models/type-enum/typesEnum";
import ChatContactInfo from "../ChatContactInfo";
import { useState } from "react";
import { setPrivateChatroomId } from "../../../redux/features/chat/chat.slice";
import GetAvatar from "../../Badge/GetAvatar";

const ChatConversationHeader = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
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
  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

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
              <Stack spacing={1} direction={"row"}>
                {onlyMediumScreen && (
                  <IconButton
                    onClick={() => dispatch(setPrivateChatroomId(undefined))}
                  >
                    <CaretLeft />
                  </IconButton>
                )}
                <GetAvatar
                  src={avatar ? avatar : undefined}
                  status={status}
                  width="50px"
                  height="50px"
                  cursor={true}
                />
              </Stack>
            </div>

            <Stack justifyContent={"center"}>
              <Typography variant="subtitle2">{nickname}</Typography>
              {status === STATUS.ONLINE ? (
                <Typography variant="subtitle2">Online</Typography>
              ) : status === STATUS.PLAYING ? (
                <Typography variant="subtitle2">Playing</Typography>
              ) : (
                <Typography variant="subtitle2">Offline</Typography>
              )}
            </Stack>
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
