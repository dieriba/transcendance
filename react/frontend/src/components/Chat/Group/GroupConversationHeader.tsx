import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { CaretLeft } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { ChatroomGroupType } from "../../../models/groupChat";
import GroupIcon from "./GroupIcon";
import { Restriction } from "../../../models/type-enum/typesEnum";
import GroupComp from "./GroupComp";
import { useState } from "react";
import { setGroupChatroomId } from "../../../redux/features/groups/group.slice";

const GroupConversationHeader = () => {
  const theme = useTheme();
  const currentChatroom = useAppSelector(
    (state: RootState) => state.groups.currentChatroom
  );
  const dispatch = useAppDispatch();
  const toOpen =
    (currentChatroom as ChatroomGroupType).restrictedUsers.length === 0 ||
    (currentChatroom as ChatroomGroupType).restrictedUsers[0].restriction ===
      Restriction.MUTED;

  const [open, setOpen] = useState(false);

  const { chatroomName, type } = currentChatroom as ChatroomGroupType;

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
            <IconButton onClick={() => dispatch(setGroupChatroomId(undefined))}>
              <CaretLeft />
            </IconButton>
            <div onClick={() => setOpen(true)}>
              <GroupIcon type={type} size={40} />
            </div>

            <Stack>
              <Typography variant="subtitle2">{chatroomName}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <Divider />
      {toOpen && open && (
        <GroupComp openDialog={open} handleClose={() => setOpen(false)} />
      )}
    </>
  );
};

export default GroupConversationHeader;
