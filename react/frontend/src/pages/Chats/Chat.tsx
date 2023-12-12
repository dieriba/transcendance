import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useGetAllPrivateChatroomsQuery } from "../../redux/features/chat/chats.api.slice";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch } from "../../redux/hooks";
import {
  addNewChatroom,
  deleteChatroomById,
  setPrivateChatroom,
  updatePrivateChatroomList,
  updateUserInfo,
  updateUserStatus,
} from "../../redux/features/chat/chat.slice";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import {
  GeneralEvent,
  ChatEventPrivateRoom,
} from "../../../shared/socket.event";
import {
  PrivateChatroomType,
  MessageType,
} from "../../models/ChatContactSchema";
import { SocketServerSucessResponse } from "../../services/type";
import DesktopChat from "./DesktopChat";
import MobileChat from "./MobileChat";
import {
  UpdatedAvatarRes,
  UserUpdateStatusType,
  UserUpdated,
} from "../../models/login/UserSchema";
import { BaseChatroomTypeId } from "../../models/groupChat";
import { showSnackBar } from "../../redux/features/app/app.slice";

const Chat = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetAllPrivateChatroomsQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );

  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (data && data.data) {
      dispatch(setPrivateChatroom(data.data));
      connectSocket();

      socket.on(
        GeneralEvent.USER_CHANGED_USERNAME,
        (data: { data: UserUpdated }) => {
          dispatch(updateUserInfo(data.data));
        }
      );

      socket.on(
        GeneralEvent.USER_CHANGED_AVATAR,
        (data: { data: UpdatedAvatarRes }) => {
          dispatch(updateUserInfo(data.data));
        }
      );

      socket.on(
        GeneralEvent.USER_UPDATE_STATUS,
        (data: SocketServerSucessResponse & { data: UserUpdateStatusType }) => {
          dispatch(updateUserStatus(data.data));
        }
      );

      socket.on(
        ChatEventPrivateRoom.NEW_CHATROOM,
        (
          data: SocketServerSucessResponse & {
            data: PrivateChatroomType;
          }
        ) => {
          dispatch(addNewChatroom(data.data));
        }
      );

      socket.on(
        ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE,
        (data: SocketServerSucessResponse & { data: MessageType }) => {
          dispatch(updatePrivateChatroomList(data.data));
        }
      );

      socket.on(
        ChatEventPrivateRoom.CLEAR_CHATROOM,
        (data: SocketServerSucessResponse & { data: BaseChatroomTypeId }) => {
          dispatch(deleteChatroomById(data.data.chatroomId));
          dispatch(
            showSnackBar({ severity: data.severity, message: data.message })
          );
        }
      );
    }
    return () => {
      socket.off(ChatEventPrivateRoom.CLEAR_CHATROOM);
      socket.off(ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE);
      socket.off(ChatEventPrivateRoom.NEW_CHATROOM);
      socket.off(GeneralEvent.USER_UPDATE_STATUS);
      socket.off(GeneralEvent.USER_CHANGED_USERNAME);
      socket.off(GeneralEvent.USER_CHANGED_AVATAR);
    };
  }, [data, dispatch]);
  if (isLoading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
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
    return onlyMediumScreen ? <MobileChat /> : <DesktopChat />;
  }
};

export default Chat;
