import {
  Avatar,
  AvatarGroup,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CaretDown } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { ChatroomGroupType } from "../../../models/groupChat";

const GroupConversationHeader = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const chatroomInfo = useAppSelector(
    (state: RootState) => state.groups.currentChatroom
  );

  const { chatroomName, id } = chatroomInfo as ChatroomGroupType;

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
            <div onClick={() => {}}>
              <Box>
                <AvatarGroup max={3}>
                  <Avatar />
                  <Avatar />
                  <Avatar />
                </AvatarGroup>
              </Box>
            </div>

            <Stack>
              <Typography variant="subtitle2">{chatroomName}</Typography>
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

export default GroupConversationHeader;
