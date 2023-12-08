import { Avatar, Stack, TextField } from "@mui/material";
import DialogI from "../Dialog/DialogI";
import BadgeAvatar from "../Badge/BadgeAvatar";
import PlayingAvatar from "../Badge/PlayingAvatar";
import GameInvitation from "../game-invitation/GameInvitation";
import { useState } from "react";
import { UserWithProfile } from "../../models/ChatContactSchema";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import ButtonDialogContained from "../Button/ButtonDialogContained";
import BlockUserDialog from "../friends/BlockFriendDialog";
import { GameController, Trash } from "phosphor-react";

interface UserProfileGroupProps {
  openDialog: boolean;
  handleClose: () => void;
}

const UserProfileGroup = ({
  handleClose,
  openDialog,
}: UserProfileGroupProps) => {
  const { myId, currentUser } = useAppSelector(
    (state: RootState) => state.groups
  );

  const { profile, pong, id, nickname, status } =
    currentUser as UserWithProfile;

  const [open, setOpen] = useState<{ gameInvitation: boolean; block: boolean }>(
    { gameInvitation: false, block: false }
  );
  const src = profile?.avatar ?? undefined;
  let rating: number = 0;
  let victory: number = 0;
  let losses: number = 0;

  if (pong) {
    rating = pong.rating;
    victory = pong.victory;
    losses = pong.losses;
  }

  return (
    <>
      <DialogI open={openDialog} handleClose={handleClose}>
        <Stack
          p={5}
          alignItems={"center"}
          justifyContent={"center"}
          spacing={2}
        >
          {status === "ONLINE" ? (
            <PlayingAvatar>
              <Avatar sx={{ width: "100px", height: "100px" }} src={src} />
            </PlayingAvatar>
          ) : status === "PLAYING" ? (
            <BadgeAvatar>
              <Avatar />
            </BadgeAvatar>
          ) : (
            <Avatar src={src} />
          )}

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
              <ButtonDialogContained
                open={open.block}
                handleOpen={() => setOpen((prev) => ({ ...prev, block: true }))}
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
