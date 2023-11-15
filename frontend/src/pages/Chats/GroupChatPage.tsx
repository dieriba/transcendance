import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import {
  ChatEventPrivateRoom,
  ChatEventGroup,
} from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { useGetAllGroupQuery } from "../../redux/features/groups/group.api.slice";
import {
  addNewChatroom,
  deleteChatroom,
  restrict,
  setGroupChatroom,
  unrestrict,
  updateChatroom,
  updateGroupChatroomListAndMessage,
} from "../../redux/features/groups/group.slice";
import {
  ChatroomGroupType,
  MessageGroupType,
  RestrictedUserResponseType,
  UnrestrictType,
} from "../../models/groupChat";
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
  const { currentGroupChatroomId, groupChatroom } = useAppSelector(
    (state: RootState) => state.groups
  );
  const { open } = useAppSelector((state: RootState) => state.sidebar);
  useEffect(() => {
    if (data && data.data) {
      dispatch(setGroupChatroom(data.data));
      connectSocket();
      if (!socket) return;

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

      socket.on(
        ChatEventGroup.USER_UNBANNED_UNKICKED_UNMUTED,
        (data: SocketServerSucessResponse & { data: UnrestrictType }) => {
          dispatch(unrestrict(data.data));
        }
      );

      socket.on(
        ChatEventGroup.RECEIVE_GROUP_MESSAGE,
        (data: SocketServerSucessResponse & { data: MessageGroupType }) => {
          dispatch(updateGroupChatroomListAndMessage(data.data));
        }
      );
    }
    return () => {
      socket.off(ChatEventGroup.NEW_CHATROOM);
      socket.off(ChatEventGroup.CLEAR_CHATROOM);
      socket.off(ChatEventGroup.EDIT_GROUP_CHATROOM);
      socket.off(ChatEventGroup.USER_UNBANNED_UNKICKED_UNMUTED);
      socket.off(ChatEventGroup.USER_BANNED_MUTED_KICKED_RESTRICTION);
      socket.off(ChatEventGroup.RECEIVE_GROUP_MESSAGE);
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
  }
};

export default GroupChatPage;
