import { Box, Stack } from "@mui/material";
import ChatConversationHeader from "./ChatConversationHeader";
import ChatConversationBody from "./ChatConversationBody";
import ChatConversationFooter from "./ChatConversationFooter";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { useAppDispatch } from "../../../redux/hooks";
import { socket } from "../../../utils/getSocket";
import { GeneralEvent } from "../../../../shared/socket.event";
import {
  UpdatedAvatarRes,
  UserUpdated,
} from "../../../models/login/UserSchema";
import { updateUserInfo } from "../../../redux/features/chat/chat.slice";

const ChatConversation = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;

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

    return () => {
      socket.off(GeneralEvent.USER_CHANGED_USERNAME);
      socket.off(GeneralEvent.USER_CHANGED_AVATAR);
    };
  }, [dispatch]);

  return (
    <>
      <Box
        sx={{
          height: "100%",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background.paper,
          width: "100%",
        }}
      >
        <Stack height="100%" width="auto">
          <ChatConversationHeader />
          <ChatConversationBody />
          <ChatConversationFooter />
        </Stack>
      </Box>
    </>
  );
};

export default ChatConversation;
