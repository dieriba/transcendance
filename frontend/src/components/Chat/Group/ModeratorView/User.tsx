import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { GameController, Notebook, UserMinus } from "phosphor-react";

interface UserProps {
  nickname: string;
  /*handleNewAdmin: () => void;
    handleDeleteUser: () => void;
    handleSetModerator: () => void;
    handleRestrictUser: () => void;*/
}

const User = ({ nickname }: UserProps) => {
  return (
    <Stack
      width="100%"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography>{nickname}</Typography>
      <Stack direction="row">
        <Tooltip title={`play with ${nickname}`}>
          <IconButton>
            <GameController size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`${nickname} details`}>
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default User;
