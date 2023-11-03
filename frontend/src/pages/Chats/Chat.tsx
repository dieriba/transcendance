import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import ChatContact from "../../components/Chat/ChatContact";
import ChatConversation from "../../components/Chat/ChatConversation/ChatConversation";
import { useGetAllPrivateChatroomsQuery } from "../../redux/features/chat/chats.api.slice";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setPrivateChatroom } from "../../redux/features/chat/chatSlice";
import { useEffect } from "react";

const Chat = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetAllPrivateChatroomsQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );
  const currentPrivateChatroomId = useAppSelector(
    (state) => state.chat.currentPrivateChatroomId
  );
  const { open } = useAppSelector((state) => state.sidebar);
  useEffect(() => {
    if (data && data.data) {
      dispatch(setPrivateChatroom(data.data));
    }
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
        <ChatContact />
        {!currentPrivateChatroomId ? (
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
              <Typography>Select a conversation!</Typography>
            </Stack>
          </Box>
        ) : (
          <ChatConversation />
        )}
      </Stack>
    );
  }
};

export default Chat;
