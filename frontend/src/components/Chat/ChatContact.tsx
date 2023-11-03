import { Stack, Box, Divider } from "@mui/material";
import { MagnifyingGlass } from "phosphor-react";
import { Search, SearchIconWrapper, StyledInputBase } from "../search";
import ChatBox from "./ChatBox";
import { useTheme } from "@mui/material/styles";
import { useAppSelector } from "../../redux/hooks";

const ChatContact = () => {
  const theme = useTheme();
  const chats = useAppSelector((state) => state.chat.privateChatroom);
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
      <Stack height="100vh">
        <Stack p={3} sx={{ width: "100%" }} justifyContent="center">
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search" />
          </Search>
        </Stack>
        <Divider />
        <Stack
          sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
          spacing={1}
        >
          <Stack p={2} spacing={0}>
            {chats.map(({ id, users, messages }) => {
              const user = users[0].user;
              return (
                <ChatBox
                  time={messages.length === 0 ? "" : "11"}
                  avatar={user.profile?.avatar}
                  online={user.status === "ONLINE" ? true : false}
                  username={users[0].user.nickname}
                  msg={
                    messages.length === 0
                      ? "Start Conversation"
                      : messages[0].content
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
