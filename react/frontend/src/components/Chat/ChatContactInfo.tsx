import { Avatar, DialogTitle, Divider, Stack, Tooltip } from "@mui/material";
import { GameController, Trash, User } from "phosphor-react";
import { useAppSelector } from "../../redux/hooks";
import { useState } from "react";
import { PrivateChatroomType } from "../../models/ChatContactSchema";
import { RootState } from "../../redux/store";
import DialogI from "../Dialog/DialogI";
import { useTheme } from "@mui/material/styles";
import GameInvitation from "../game-invitation/GameInvitation";
import BlockUserDialog from "../friends/BlockFriendDialog";
import DeleteFriendDialog from "../friends/DeleteFriendDialog";
import ButtonDialogOutlined from "../Button/ButtonDialogOutlined";
import UserProfile from "../Profile/UserProfile";

import StyledBadge from "../Badge/StyledBadge";

interface ChatContactInfoProps {
  openDialog: boolean;
  handleClose: () => void;
}

const ChatContactInfo = ({ openDialog, handleClose }: ChatContactInfoProps) => {
  const theme = useTheme();

  const [open, setOpen] = useState<{
    block: boolean;
    delete: boolean;
    gameInvitation: boolean;
    profile: boolean;
  }>({ block: false, delete: false, gameInvitation: false, profile: false });

  const myNickname = useAppSelector(
    (state: RootState) => state.user.user?.nickname
  );
  const chatroomInfo = useAppSelector(
    (state: RootState) => state.chat.currentChatroom as PrivateChatroomType
  );
  const { id, nickname, pong, friends, profile, status } =
    chatroomInfo.users[0].user;

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
              {status === "ONLINE" ? (
                <>
                  <Tooltip placement="top" title={nickname}>
                    <StyledBadge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      variant="dot"
                    >
                      <Avatar
                        src={profile?.avatar ? profile?.avatar : undefined}
                        sx={{ height: 64, width: 64 }}
                      />
                    </StyledBadge>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip placement="top" title={nickname}>
                    <Avatar
                      src={profile?.avatar ? profile?.avatar : undefined}
                      sx={{ height: 64, width: 64 }}
                    />
                  </Tooltip>
                </>
              )}
            </Stack>
            <Divider />
            <Stack spacing={2}>
              <ButtonDialogOutlined
                open={open.profile}
                handleOpen={() =>
                  setOpen((prev) => ({ ...prev, profile: true }))
                }
                buttonName="Profile"
                icon={<User />}
                children={
                  <UserProfile
                    open={open.profile}
                    handleClose={() =>
                      setOpen((prev) => ({ ...prev, profile: false }))
                    }
                    myNickname={myNickname}
                    user={{ status, id, nickname, profile, pong }}
                  />
                }
              />
              <ButtonDialogOutlined
                open={open.gameInvitation}
                handleOpen={() =>
                  setOpen((prev) => ({ ...prev, gameInvitation: true }))
                }
                children={
                  <GameInvitation
                    open={open.gameInvitation}
                    handleClose={() =>
                      setOpen((prev) => ({ ...prev, gameInvitation: false }))
                    }
                    id={id}
                    nickname={nickname}
                  />
                }
                icon={<GameController />}
                buttonName={`Play with ${nickname}`}
              />
              <Stack direction="row" alignItems="center" spacing={2}>
                <ButtonDialogOutlined
                  open={open.block}
                  handleOpen={() =>
                    setOpen((prev) => ({ ...prev, block: true }))
                  }
                  children={
                    <BlockUserDialog
                      open={open.block}
                      handleClose={() =>
                        setOpen((prev) => ({ ...prev, block: false }))
                      }
                      friendId={id}
                      nickname={nickname}
                    />
                  }
                  icon={<Trash />}
                  buttonName={`Block ${nickname}`}
                />

                {friends.length > 0 && (
                  <ButtonDialogOutlined
                    open={open.delete}
                    handleOpen={() =>
                      setOpen((prev) => ({ ...prev, delete: true }))
                    }
                    children={
                      <DeleteFriendDialog
                        open={open.delete}
                        handleClose={() =>
                          setOpen((prev) => ({ ...prev, delete: false }))
                        }
                        friendId={id}
                        nickname={nickname}
                      />
                    }
                    icon={<Trash />}
                    buttonName={`Delete ${nickname}`}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </DialogI>
    </>
  );
};

export default ChatContactInfo;
