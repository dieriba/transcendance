import {
  Avatar,
  Button,
  DialogTitle,
  Divider,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { Bell, Trash } from "phosphor-react";
import { useAppSelector } from "../../redux/hooks";
import { useState } from "react";

import CustomDialog from "../Dialog/CustomDialog";
import {
  useDeleteFriendMutation,
  useBlockFriendMutation,
} from "../../redux/features/friends/friends.api.slice";
import BadgeAvatar from "../Badge/BadgeAvatar";
import { BaseFriendTypeWithChatroom } from "../../services/type";
import { PrivateChatroomType } from "../../models/ChatContactSchema";
import { RootState } from "../../redux/store";
import DialogI from "../Dialog/DialogI";
import { useTheme } from "@mui/material/styles";

interface ChatContactInfoProps {
  openDialog: boolean;
  handleClose: () => void;
}

const ChatContactInfo = ({ openDialog, handleClose }: ChatContactInfoProps) => {
  const theme = useTheme();
  const handleDeleteFriend = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      await deleteFriend({ friendId }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlockUser = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      await blockUser({ friendId }).unwrap();
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
    <>
      <DialogI open={openDialog} handleClose={handleClose}>
        <DialogTitle sx={{ backgroundColor: theme.palette.background.paper }}>
          {"Contact Info"}
        </DialogTitle>
        <Stack
          sx={{
            backgroundColor: theme.palette.background.paper,
            height: "100%",
          }}
        >
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
            <Stack
              alignItems="center"
              justifyContent={"center"}
              direction="row"
              spacing={2}
            >
              {user.status === "ONLINE" ? (
                <>
                  <Tooltip placement="top" title={user.nickname}>
                    <BadgeAvatar>
                      <Avatar
                        src={
                          user.profile?.avatar
                            ? user.profile?.avatar
                            : undefined
                        }
                        sx={{ height: 64, width: 64 }}
                      />
                    </BadgeAvatar>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip placement="top" title={user.nickname}>
                    <Avatar
                      src={
                        user.profile?.avatar ? user.profile?.avatar : undefined
                      }
                      sx={{ height: 64, width: 64 }}
                    />
                  </Tooltip>
                </>
              )}
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
        />
        <CustomDialog
          handleOnClick={handleDeleteFriend}
          open={open.delete}
          handleClose={() => setOpen((prev) => ({ ...prev, delete: false }))}
          title="Delete friend  ?"
          content="Do you really want to delete that friend ?"
          friendId={user.id}
        />
      </DialogI>
    </>
  );
};

export default ChatContactInfo;
