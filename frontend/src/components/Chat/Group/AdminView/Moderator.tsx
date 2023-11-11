import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  CrownSimple,
  ArrowDown,
  UserMinus,
  X,
  GameController,
  Notebook,
} from "phosphor-react";

interface ModeratorProps {
  nickname: string;
  /*handleNewAdmin: () => void;
  handleDeleteUser: () => void;
  handleSetUser: () => void;
  handleRestrictUser: () => void;*/
}

const Moderator = ({ nickname }: ModeratorProps) => {
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
        <Tooltip title={`set ${nickname} as chat admin`}>
          <IconButton>
            <CrownSimple size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`set ${nickname} as user`}>
          <IconButton>
            <ArrowDown size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <X size={20} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default Moderator;
