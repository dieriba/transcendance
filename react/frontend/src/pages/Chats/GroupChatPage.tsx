import { Box, CircularProgress, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch } from "../../redux/hooks";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import { ChatEventGroup, GeneralEvent } from "../../../shared/socket.event";
import {
  SocketServerSucessResponse,
  SocketServerSucessWithChatroomId,
} from "../../services/type";
import { useGetAllGroupQuery } from "../../redux/features/groups/group.api.slice";
import {
  addNewChatroom,
  deleteChatroom,
  deleteGroupInvitation,
  deleteJoinableGroup,
  leaveChatroom,
  removeBlockedUser,
  restrict,
  setGroupChatroom,
  setGroupChatroomId,
  unrestrict,
  unrestrictUser,
  updateChatroom,
  updateGroupChatroomListAndMessage,
  clearCurrentChatroom,
} from "../../redux/features/groups/group.slice";
import {
  BaseChatroomTypeId,
  ChatroomGroupType,
  MessageGroupType,
  RestrictedUserResponseType,
  UnrestrictType,
} from "../../models/groupChat";
import { editGroupResponseType } from "../../models/EditGroupSchema";
import { UserProfileBanLifeType } from "../../models/ChatContactSchema";
import GroupMobileChat from "../../components/Chat/Group/GroupMobileChat";
import GroupDesktopChat from "../../components/Chat/Group/GroupDesktopChat";
import { CHATBAR_WIDTH } from "../../utils/constant";
import { BaseUserInfoType } from "../../models/login/UserSchema";

const GroupChatPage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, error } = useGetAllGroupQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (data?.data) {
      dispatch(setGroupChatroom(data.data));
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
        ChatEventGroup.USER_UNRESTRICTED,
        (
          data: SocketServerSucessWithChatroomId & {
            data: { user: UserProfileBanLifeType };
          }
        ) => {
          dispatch(
            unrestrictUser({
              data: data.data.user,
              chatroomId: data.chatroomId,
            })
          );
        }
      );

      socket.on(
        ChatEventGroup.CLEAR_CHATROOM,
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

      socket.on(
        ChatEventGroup.BEEN_KICKED,
        (data: SocketServerSucessResponse & { data: BaseChatroomTypeId }) => {
          dispatch(leaveChatroom(data.data));
        }
      );

      socket.on(
        ChatEventGroup.GROUP_CHATROOM_DELETED,
        (data: SocketServerSucessResponse & { data: BaseChatroomTypeId }) => {
          dispatch(leaveChatroom(data.data));
        }
      );

      socket.on(
        GeneralEvent.REMOVE_BLOCKED_USER,
        (data: SocketServerSucessResponse & { data: BaseUserInfoType }) => {
          dispatch(removeBlockedUser(data.data.id));
        }
      );

      socket.on(
        ChatEventGroup.DELETE_GROUP,
        (data: SocketServerSucessResponse & { data: BaseChatroomTypeId }) => {
          dispatch(deleteJoinableGroup(data.data.chatroomId));
          dispatch(deleteGroupInvitation(data.data.chatroomId));
        }
      );
    }
    return () => {
      socket.off(ChatEventGroup.DELETE_GROUP);
      socket.off(GeneralEvent.REMOVE_BLOCKED_USER);
      socket.off(ChatEventGroup.USER_UNRESTRICTED);
      socket.off(ChatEventGroup.GROUP_CHATROOM_DELETED);
      socket.off(ChatEventGroup.BEEN_KICKED);
      socket.off(ChatEventGroup.NEW_CHATROOM);
      socket.off(ChatEventGroup.CLEAR_CHATROOM);
      socket.off(ChatEventGroup.UPDATED_GROUP_CHATROOM);
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
          width: CHATBAR_WIDTH,
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
    if (typeof error === "object" && "data" in error) {
      dispatch(setGroupChatroomId(undefined));
      dispatch(clearCurrentChatroom());
      dispatch(deleteChatroom((error.data as BaseChatroomTypeId).chatroomId));
    }
  } else {
    return onlyMediumScreen ? <GroupMobileChat /> : <GroupDesktopChat />;
  }
};

export default GroupChatPage;
