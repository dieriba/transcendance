import { Stack, TextField } from "@mui/material";
import DialogI from "../Dialog/DialogI";
import GameInvitation from "../game-invitation/GameInvitation";
import { useEffect, useState } from "react";
import { UserWithProfile } from "../../models/ChatContactSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import ButtonDialogContained from "../Button/ButtonDialogContained";
import BlockUserDialog from "../friends/BlockFriendDialog";
import { GameController, Trash } from "phosphor-react";
import { connectSocket, socket } from "../../utils/getSocket";
import { GeneralEvent } from "../../../shared/socket.event";
import { BaseUserInfoType } from "../../models/login/UserSchema";
import { SocketServerSucessResponse } from "../../services/type";
import { showSnackBar } from "../../redux/features/app/app.slice";
import { addBlockedUser } from "../../redux/features/groups/group.slice";
import UnblockUserDialog from "../friends/UnblockFriendDialog";
import GetAvatar from "../Badge/GetAvatar";

interface UserProfileGroupProps {
  openDialog: boolean;
  handleClose: () => void;
}

const UserProfileGroup = ({
  handleClose,
  openDialog,
}: UserProfileGroupProps) => {
  const { myId, currentUser, blockedUser } = useAppSelector(
    (state: RootState) => state.groups
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    connectSocket();
    socket.on(
      GeneralEvent.NEW_BLOCKED_USER,
      (data: SocketServerSucessResponse & { data: BaseUserInfoType }) => {
        dispatch(addBlockedUser({ id: data.data.id }));
        dispatch(showSnackBar({ message: data.message }));
      }
    );

    return () => {
      socket.off(GeneralEvent.NEW_BLOCKED_USER);
    };
  }, [dispatch]);

  const { profile, pong, id, nickname, status } =
    currentUser as UserWithProfile;

  const [open, setOpen] = useState<{
    gameInvitation: boolean;
    block: boolean;
    unblock: boolean;
  }>({ gameInvitation: false, block: false, unblock: false });
  const src = profile?.avatar ?? undefined;
  let rating: number = 0;
  let victory: number = 0;
  let losses: number = 0;

  if (pong) {
    rating = pong.rating;
    victory = pong.victory;
    losses = pong.losses;
  }
  console.log({ currentUser });

  const isBlocked = blockedUser.find((user) => user.id === id);

  return (
    <>
      <DialogI open={openDialog} handleClose={handleClose}>
        <Stack
          p={5}
          alignItems={"center"}
          justifyContent={"center"}
          spacing={2}
        >
          <GetAvatar src={src} status={status} width="100px" height="100px" />

          <TextField
            fullWidth
            label="Lastname"
            disabled
            value={profile.lastname}
          />
          <TextField
            fullWidth
            label="Firstname"
            disabled
            value={profile.firstname}
          />
          <TextField fullWidth label="Nickname" disabled value={nickname} />
          <TextField fullWidth label="Pong Rating" disabled value={rating} />
          <TextField fullWidth label="Pong Victory" disabled value={victory} />
          <TextField fullWidth label="Pong losses" disabled value={losses} />
          {myId !== id && (
            <>
              {isBlocked ? (
                <ButtonDialogContained
                  open={open.unblock}
                  handleOpen={() =>
                    setOpen((prev) => ({ ...prev, unblock: true }))
                  }
                  children={
                    <UnblockUserDialog
                      open={open.unblock}
                      handleClose={() =>
                        setOpen((prev) => ({ ...prev, unblock: false }))
                      }
                      friendId={id}
                      nickname={nickname}
                    />
                  }
                  icon={<Trash />}
                  buttonName={`Unblock ${nickname}`}
                />
              ) : (
                <ButtonDialogContained
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
              )}
              <ButtonDialogContained
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
            </>
          )}
        </Stack>
      </DialogI>
    </>
  );
};

export default UserProfileGroup;
