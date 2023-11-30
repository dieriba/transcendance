import { Avatar, Button, DialogProps, Stack, TextField } from "@mui/material";
import DialogI from "../Dialog/DialogI";
import BadgeAvatar from "../Badge/BadgeAvatar";
import PlayingAvatar from "../Badge/PlayingAvatar";
import GameInvitation from "../game-invitation/GameInvitation";
import { useState } from "react";
import { UserWithProfile } from "../../models/ChatContactSchema";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";

interface UserProfileGroupProps extends DialogProps {
  open: boolean;
  handleClose: () => void;
}

const UserProfileGroup = ({ handleClose, open }: UserProfileGroupProps) => {
  const { myId, currentUser } = useAppSelector(
    (state: RootState) => state.groups
  );

  const { profile, pong, id, nickname, status } =
    currentUser as UserWithProfile;

  const [openGameInvitation, setOpenGameInvitation] = useState(false);
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
      <DialogI open={open} handleClose={handleClose}>
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
            <Button
              onClick={() => setOpenGameInvitation(true)}
              fullWidth
              variant="contained"
              color="inherit"
            >{`Play with ${nickname}`}</Button>
          )}
        </Stack>
      </DialogI>
      {myId !== id && openGameInvitation && (
        <GameInvitation
          id={id}
          nickname={nickname}
          open={openGameInvitation}
          handleClose={() => setOpenGameInvitation(false)}
        />
      )}
    </>
  );
};

export default UserProfileGroup;