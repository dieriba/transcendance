import { Stack, Box, useMediaQuery } from "@mui/material";
import ChatBox from "./ChatBox";
import { useTheme } from "@mui/material/styles";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { CHATBAR_WIDTH } from "../../utils/constant";
import { useState } from "react";
import ButtonDialogContained from "../Button/ButtonDialogContained";
import CreateNewChatConversation from "./ChatConversation/CreateNewChatConversion";
import { Plus } from "phosphor-react";

const ChatContact = () => {
  const theme = useTheme();
  const chats = useAppSelector(
    (state: RootState) => state.chat.privateChatroom
  );
  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const myId = useAppSelector((state: RootState) => state.user.user?.id);
  return (
    <Box
      sx={{
        position: "relative",
        width: onlyMediumScreen ? "100%" : CHATBAR_WIDTH,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
      }}
      p={2}
    >
      <Stack height="100vh">
        <Stack
          sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
          spacing={1}
        >
          <ButtonDialogContained
            children={
              <CreateNewChatConversation
                open={open}
                handleClose={() => setOpen(false)}
              />
            }
            icon={<Plus />}
            buttonName={"conversation"}
            open={open}
            handleOpen={() => setOpen(true)}
          />
          <Stack spacing={1}>
            {chats.map(({ id, users, messages }) => {
              const user = users[0].user;
              const lastMsg = messages[messages.length - 1];
              let date: Date | undefined = undefined;

              if (messages.length > 0) date = new Date(messages[0].createdAt);
              return (
                <ChatBox
                  time={
                    date
                      ? `${date.getHours().toString().padStart(2, "0")}:${date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`
                      : ""
                  }
                  avatar={
                    user.profile?.avatar ? user.profile?.avatar : undefined
                  }
                  online={user.status === "ONLINE" ? true : false}
                  username={users[0].user.nickname}
                  msg={
                    messages.length === 0
                      ? "Start Conversation"
                      : lastMsg.userId === myId
                      ? `You: ${lastMsg.content}`
                      : lastMsg.content
                  }
                  unread={0}
                  key={id}
                  chatroomId={id}
                />
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatContact;
