import {
  Avatar,
  DialogProps,
  Stack,
  TextField,
} from "@mui/material";
import { FriendType } from "../../models/FriendsSchema";
import DialogI from "../Dialog/DialogI";
import BadgeAvatar from "../Badge/BadgeAvatar";
import PlayingAvatar from "../Badge/PlayingAvatar";

interface UserProfileProps extends DialogProps {
  user: FriendType;
  open: boolean;
  handleClose: () => void;
}

const UserProfile = ({
  user: {
    friend: { profile, id, nickname, pongLosses, pongVictory, status },
  },
  handleClose,
  open,
}: UserProfileProps) => {
  const src = profile?.avatar ?? undefined;

  return (
    <DialogI open={open} handleClose={handleClose}>
      <Stack p={5} alignItems={"center"} justifyContent={"center"} spacing={2}>
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
        <TextField
          fullWidth
          label="Pong Victory"
          disabled
          value={pongVictory}
        />
        <TextField fullWidth label="Pong losses" disabled value={pongLosses} />
      </Stack>
    </DialogI>
  );
};

export default UserProfile;
