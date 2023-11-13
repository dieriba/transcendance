import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { CaretDown, X } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { ChatroomGroupType } from "../../../models/groupChat";
import GroupIcon from "./GroupIcon";
import { toggleOpenGroupSidebar } from "../../../redux/features/groups/groupSlice";

const GroupConversationHeader = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const chatroomInfo = useAppSelector(
    (state: RootState) => state.groups.currentChatroom
  );
  const open = useAppSelector(
    (state: RootState) => state.groups.openGroupSidebar
  );
  const { chatroomName, type } = chatroomInfo as ChatroomGroupType;

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
          <Stack direction="row" spacing={2} sx={{ cursor: "pointer" }}>
            <div
              onClick={() => {
                dispatch(toggleOpenGroupSidebar());
              }}
            >
              <Box>
                <GroupIcon type={type} size={40} />
              </Box>
            </div>

            <Stack>
              <Typography variant="subtitle2">{chatroomName}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => {
                dispatch(toggleOpenGroupSidebar());
              }}
            >
              {open ? <X /> : <CaretDown />}
            </IconButton>
          </Stack>
        </Stack>
      </Box>
      <Divider />
    </>
  );
};

export default GroupConversationHeader;
