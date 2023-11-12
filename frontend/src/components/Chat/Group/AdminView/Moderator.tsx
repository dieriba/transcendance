import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  CrownSimple,
  ArrowDown,
  UserMinus,
  X,
  GameController,
  Notebook,
} from "phosphor-react";
import { ROLE } from "../../../../models/type-enum/typesEnum";

interface ModeratorProps {
  id: string;
  nickname: string;
  handleNewAdmin: (data: { id: string; nickname: string }) => void;
  handleChangeRole: (data: {
    id: string;
    nickname: string;
    role: ChatRoleType;
  }) => void;
  /*handleDeleteUser: () => void;
  handleSetUser: () => void;
  handleRestrictUser: () => void;*/
}

const Moderator = ({
  id,
  nickname,
  handleNewAdmin,
  handleChangeRole,
}: ModeratorProps) => {
  return (
    <Stack width="100%" alignItems="flex-start">
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
          <IconButton onClick={() => handleNewAdmin({ id, nickname })}>
            <CrownSimple size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`set ${nickname} as user`}>
          <IconButton
            onClick={() =>
              handleChangeRole({ id, nickname, role: ROLE.REGULAR_USER })
            }
          >
            <ArrowDown size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`delete ${nickname}`}>
          <IconButton>
            <X size={20} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default Moderator;
