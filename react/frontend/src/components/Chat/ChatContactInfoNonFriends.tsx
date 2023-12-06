import {
  Avatar,
  Button,
  DialogTitle,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import { Trash } from "phosphor-react";
import { useAppSelector } from "../../redux/hooks";
import { useState } from "react";

import BadgeAvatar from "../Badge/BadgeAvatar";
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

  const [open, setOpen] = useState<{
    friendRequest: boolean;
    block: boolean;
  }>({ block: false, friendRequest: false });

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
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  setOpen((prev) => ({ ...prev, gameInvitation: true }))
                }
              >{`Play with ${user.nickname}`}</Button>
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
                  Send Friend Request
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </DialogI>
    </>
  );
};

export default ChatContactInfo;
