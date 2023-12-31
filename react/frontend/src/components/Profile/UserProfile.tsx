import { Button, DialogProps, Stack, TextField } from "@mui/material";
import DialogI from "../Dialog/DialogI";
import GameInvitation from "../game-invitation/GameInvitation";
import { useState } from "react";
import { UserWithProfile } from "../../models/ChatContactSchema";
import GetAvatar from "../Badge/GetAvatar";

interface UserProfileProps extends DialogProps {
  user: UserWithProfile;
  myNickname?: string;
  open: boolean;
  handleClose: () => void;
}

const UserProfile = ({
  user: { profile, id, nickname, pong, status },
  handleClose,
  open,
  myNickname,
}: UserProfileProps) => {
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
          {!myNickname ? (
            <Button
              onClick={() => setOpenGameInvitation(true)}
              fullWidth
              variant="contained"
              color="inherit"
            >{`Play with ${nickname}`}</Button>
          ) : (
            myNickname !== nickname && (
              <Button
                onClick={() => setOpenGameInvitation(true)}
                fullWidth
                variant="contained"
                color="inherit"
              >{`Play with ${nickname}`}</Button>
            )
          )}
        </Stack>
      </DialogI>
      {openGameInvitation && (
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

export default UserProfile;
