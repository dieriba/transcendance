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

import CustomDialog from "../Dialog/CustomDialog";
import {
  useDeleteFriendMutation,
  useBlockFriendMutation,
} from "../../redux/features/friends/friends.api.slice";
import BadgeAvatar from "../Badge/BadgeAvatar";
import { deleteChatroom } from "../../redux/features/chat/chatSlice";
import { BaseFriendTypeWithChatroom } from "../../services/type";
import { PrivateChatroomType } from "../../models/ChatContactSchema";
import { RootState } from "../../redux/store";
const ChatContactInfo = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const handleDeleteFriend = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId, chatroomId } = data;
      console.log("ok");

      const res = await deleteFriend({ friendId }).unwrap();
      chatroomId && dispatch(deleteChatroom(chatroomId));
      console.log({ res });
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlockUser = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId, chatroomId } = data;

      const res = await blockUser({ friendId }).unwrap();

      chatroomId && dispatch(deleteChatroom(chatroomId));
      console.log({ res });
    } catch (error) {
      console.log(error);
    }
  };

  const [open, setOpen] = useState<{
    block: boolean;
    delete: boolean;
  }>({ block: false, delete: false });

  const [deleteFriend] = useDeleteFriendMutation();
  const [blockUser] = useBlockFriendMutation();

  const chatroomInfo = useAppSelector(
    (state: RootState) => state.chat.currentChatroom as PrivateChatroomType
  );
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
            height: "70px",
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
        <Divider />
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
            {user.status === "ONLINE" ? (
              <>
                <BadgeAvatar>
                  <Avatar
                    src={user.profile?.avatar}
                    sx={{ height: 64, width: 64 }}
                  />
                </BadgeAvatar>
              </>
            ) : (
              <>
                <Avatar
                  src={user.profile?.avatar}
                  sx={{ height: 64, width: 64 }}
                />
              </>
            )}
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
          <Stack>
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
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              size="small"
              startIcon={<Trash />}
              variant="outlined"
              fullWidth
              sx={{ textTransform: "capitalize" }}
              onClick={() =>
                setOpen((prev) => ({
                  ...prev,
                  block: true,
                }))
              }
            >
              Block
            </Button>

            <Button
              startIcon={<Trash />}
              size="small"
              variant="outlined"
              fullWidth
              sx={{ textTransform: "capitalize" }}
              onClick={() =>
                setOpen((prev) => ({
                  ...prev,
                  delete: true,
                }))
              }
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <CustomDialog
        handleOnClick={handleBlockUser}
        open={open.block}
        handleClose={() => setOpen((prev) => ({ ...prev, block: false }))}
        title="Block User ?"
        content="Do you really want to block that user ?"
        friendId={user.id}
        chatroomId={chatroomInfo.id}
      />
      <CustomDialog
        handleOnClick={handleDeleteFriend}
        open={open.delete}
        handleClose={() => setOpen((prev) => ({ ...prev, delete: false }))}
        title="Delete friend  ?"
        content="Do you really want to delete that friend ?"
        friendId={user.id}
        chatroomId={chatroomInfo.id}
      />
    </Box>
  );
};

export default ChatContactInfo;
