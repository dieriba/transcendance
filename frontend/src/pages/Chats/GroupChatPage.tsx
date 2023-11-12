import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import {
  ChatEventPrivateRoom,
  ChatEventGroup,
  GeneralEvent,
} from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { useGetAllGroupQuery } from "../../redux/features/groups/group.api.slice";
import {
  addNewChatroom,
  deleteChatroom,
  setGroupChatroom,
  updateChatroom,
} from "../../redux/features/groups/groupSlice";
import { ChatroomGroupType } from "../../models/groupChat";
import GroupContact from "../../components/Chat/Group/GroupContact";
import GroupConversation from "../../components/Chat/Group/GroupConversation";
import { RootState } from "../../redux/store";
import { editGroupResponseType } from "../../models/EditGroupSchema";

const GroupChatPage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetAllGroupQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const currentGroupChatroomId = useAppSelector(
    (state) => state.groups.currentGroupChatroomId
  );
  const { open } = useAppSelector((state: RootState) => state.sidebar);
  useEffect(() => {
    if (data && data.data) {
      dispatch(setGroupChatroom(data.data));
      connectSocket();
      if (!socket) return;
      /*socket.on(
        GeneralEvent.USER_LOGGED_OUT,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOfflineUser(data.data));
        }
      );

      socket.on(
        GeneralEvent.USER_LOGGED_IN,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOnlineUser(data.data));
        }
      );*/

      socket.on(
        ChatEventGroup.NEW_CHATROOM,
        (data: SocketServerSucessResponse & { data: ChatroomGroupType }) => {
          dispatch(addNewChatroom(data.data));
        }
      );

      socket.on(
        ChatEventGroup.UPDATED_GROUP_CHATROOM,
        (
          data: SocketServerSucessResponse & { data: editGroupResponseType }
        ) => {
          console.log("entered he");

          dispatch(updateChatroom(data.data));
        }
      );

      socket.on(
        ChatEventPrivateRoom.CLEAR_CHATROOM,
        (
          data: SocketServerSucessResponse & { data: { chatroomId: string } }
        ) => {
          dispatch(deleteChatroom(data.data.chatroomId));
        }
      );
    }
    return () => {
      socket.off(ChatEventGroup.NEW_CHATROOM);
      socket.off(ChatEventGroup.CLEAR_CHATROOM);
      socket.off(ChatEventGroup.EDIT_GROUP_CHATROOM);
      //socket.off(GeneralEvent.USER_LOGGED_IN);
      //socket.off(GeneralEvent.USER_LOGGED_OUT);
    };
  }, [data, dispatch]);
  if (isLoading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: 320,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack p={3} sx={{ width: "100%" }} justifyContent="center">
          <CircularProgress />
        </Stack>
      </Box>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
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
              width: open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
            }}
          >
            <Stack
              width="100%"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Typography>Select a group chat !</Typography>
            </Stack>
          </Box>
        ) : (
          <GroupConversation />
        )}
      </Stack>
    );
  }
};

export default GroupChatPage;
