import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Bell, CaretRight, Trash, X } from "phosphor-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  SHARED,
  closeSidebar,
  switchSidebarTab,
} from "../../redux/features/sidebar.slices";
import { faker } from "@faker-js/faker";
import { useState } from "react";
import DeleteUser from "./DeleteUser";
import DeleteChat from "./DeleteChat";
import BlockUser from "./BlockUser";
const ChatContactInfo = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [openDeleteUser, setDeleteUser] = useState(false);
  const [openDeleteChat, setDeleteChat] = useState(false);
  const [openBlockUser, setBlockUser] = useState(false);

  const chatroomInfo = useAppSelector((state) => state.chat.currentChatroom);
  const user = chatroomInfo.users[0].user;
  return (
    <Box width="320px" height="100vh">
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
          }}
        >
          <Stack
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={3}
          >
            <Typography variant="subtitle2">Contact Info</Typography>
            <IconButton onClick={() => dispatch(closeSidebar())}>
              <X />
            </IconButton>
          </Stack>
        </Box>
        <Stack
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: "1",
            overflowY: "scroll",
          }}
          p={3}
          spacing={3}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <Avatar src={user.profile?.avatar} sx={{ height: 64, width: 64 }} />
            <Stack spacing={0.5} alignSelf="flex-start">
              <Typography variant="subtitle2" fontWeight={600}>
                {user.nickname}
              </Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600}>
              About
            </Typography>
            <Typography variant="subtitle2">Dieri</Typography>
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2">Media & Docs</Typography>
            <Button
              onClick={() => dispatch(switchSidebarTab({ tab: SHARED }))}
              endIcon={<CaretRight />}
            >
              {" "}
              50
            </Button>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            {[1, 2, 3].map((elem) => (
              <Box key={elem}>
                <img
                  height="50px"
                  width="75px"
                  src={faker.image.food()}
                  alt={faker.person.fullName()}
                />
              </Box>
            ))}
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Bell size={22} />
              <Typography variant="subtitle2">Mute Notifications</Typography>
            </Stack>
            <Switch />
          </Stack>
          <Divider />
          {/*<Typography>2 Groups in common</Typography>
          <Stack spacing={2}>
             {[1,2,3].map((el) => <Avatar src/>)}
            </Stack> */}
          <Typography>Chats</Typography>
          <Stack direction="row" alignItems="center">
            <Button
              size="small"
              startIcon={<Trash />}
              variant="outlined"
              fullWidth
              sx={{ textTransform: "capitalize" }}
              onClick={() => setDeleteChat(true)}
            >
              Delete Chat
            </Button>
          </Stack>
          <Divider />
          <Typography variant="subtitle2">Friendship</Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              size="small"
              startIcon={<Trash />}
              variant="outlined"
              fullWidth
              sx={{ textTransform: "capitalize" }}
              onClick={() => setBlockUser(true)}
            >
              Block
            </Button>

            <Button
              startIcon={<Trash />}
              size="small"
              variant="outlined"
              fullWidth
              sx={{ textTransform: "capitalize" }}
              onClick={() => setDeleteUser(true)}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <DeleteUser
        open={openDeleteUser}
        handleClose={() => setDeleteUser(false)}
      />

      <DeleteChat
        open={openDeleteChat}
        handleClose={() => setDeleteChat(false)}
      />

      <BlockUser open={openBlockUser} handleClose={() => setBlockUser(false)} />
    </Box>
  );
};

export default ChatContactInfo;
