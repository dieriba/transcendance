import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { GameController, Notebook } from "phosphor-react";

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
      </Stack>
    </Stack>
  );
};

export default Moderator;
