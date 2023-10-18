import { Stack, Box, Divider, Typography } from "@mui/material";
import { MagnifyingGlass } from "phosphor-react";
import { ChatList } from "../../data/data";
import { Search, SearchIconWrapper, StyledInputBase } from "../search";
import ChatBox from "./ChatBox";
import { useTheme } from "@mui/material/styles";

const ChatContact = () => {
  const theme = useTheme();
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
          <Stack p={2}>
            <Typography variant="subtitle2" sx={{ color: "#676767" }}>
              Pinned
            </Typography>
            {ChatList.filter((chat) => chat.pinned).map((chat) => {
              return (
                <ChatBox
                  online={chat.online}
                  username={chat.name}
                  msg={chat.msg}
                  time={chat.time}
                  unread={chat.unread}
                  key={chat.id}
                />
              );
            })}
          </Stack>
          <Stack p={2}>
            <Typography variant="subtitle2" sx={{ color: "#676767" }}>
              All Chats
            </Typography>
            {ChatList.filter((chat) => !chat.pinned).map((chat) => {
              return (
                <ChatBox
                  online={chat.online}
                  username={chat.name}
                  msg={chat.msg}
                  time={chat.time}
                  unread={chat.unread}
                  key={chat.id}
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
