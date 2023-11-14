import { Box, Stack } from "@mui/material";
import GroupConversationHeader from "./GroupConversationHeader";
import GroupConversationBody from "./GroupConversationBody";
import GroupConversationFooter from "./GroupConversationFooter";
import { useTheme } from "@mui/material/styles";
import GroupComp from "./GroupComp";
import { RootState } from "../../../redux/store";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useEffect } from "react";
import { connectSocket, socket } from "../../../utils/getSocket";
import { ChatEventGroup } from "../../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../../services/type";
import {
  ChatroomGroupType,
  RestrictedUserResponseType,
} from "../../../models/groupChat";
import { restrict } from "../../../redux/features/groups/group.slice";
import { Restriction } from "../../../models/type-enum/typesEnum";

const GroupConversation = () => {
  const theme = useTheme();
  const { openGroupSidebar, currentChatroom } = useAppSelector(
    (state: RootState) => state.groups
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    connectSocket();
    socket.on(
      ChatEventGroup.USER_BANNED_MUTED_KICKED_RESTRICTION,
      (
        data: SocketServerSucessResponse & {
          data: RestrictedUserResponseType;
        }
      ) => {
        dispatch(restrict(data.data));
      }
    );
    return () => {
      socket.off(ChatEventGroup.USER_BANNED_MUTED_KICKED_RESTRICTION);
    };
  }, [dispatch]);
  console.log({
    count: (currentChatroom as ChatroomGroupType).restrictedUsers.length,
  });

  const toOpen =
    (currentChatroom as ChatroomGroupType).restrictedUsers.length === 0 ||
    (currentChatroom as ChatroomGroupType).restrictedUsers[0].restriction ===
      Restriction.MUTED;

  return (
    <>
      <Box
        sx={{
          height: "100%",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background.paper,
          width: openGroupSidebar
            ? "calc(100vw - 740px)"
            : "calc(100vw - 420px)",
        }}
      >
        <Stack height="100%" maxHeight="100vh" width="auto">
          <GroupConversationHeader />
          <GroupConversationBody />
          <GroupConversationFooter />
        </Stack>
      </Box>
      {toOpen && openGroupSidebar && <GroupComp />}
    </>
  );
};

export default GroupConversation;
