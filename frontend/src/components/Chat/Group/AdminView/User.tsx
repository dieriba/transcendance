import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  CrownSimple,
  ArrowUp,
  UserMinus,
  X,
  GameController,
  Notebook,
} from "phosphor-react";

interface UserProps {
  nickname: string;
  /*handleNewAdmin: () => void;
    handleDeleteUser: () => void;
    handleSetModerator: () => void;
    handleRestrictUser: () => void;*/
}

const User = ({ nickname }: UserProps) => {
  return (
    <Stack width="100%" alignItems="flex-start" justifyContent="space-between">
      <Typography>{nickname}</Typography>
      <Stack direction="row">
        <Tooltip title={`play with ${nickname}`}>
          <IconButton>
            <GameController size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`${nickname} details`}>
          <IconButton>
            <Notebook size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`set ${nickname} as chat admin`}>
          <IconButton>
            <CrownSimple size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`set ${nickname} as moderator`}>
          <IconButton>
            <ArrowUp size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <UserMinus size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <X size={18} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default User;
