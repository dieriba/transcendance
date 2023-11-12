import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  CrownSimple,
  ArrowUp,
  UserMinus,
  X,
  GameController,
  Notebook,
} from "phosphor-react";
import { ROLE } from "../../../../models/type-enum/typesEnum";

interface UserProps {
  id: string;
  nickname: string;
  handleNewAdmin: (data: { id: string; nickname: string }) => void;
  handleChangeRole: (data: {
    id: string;
    nickname: string;
    role: ChatRoleType;
  }) => void;
  /* handleDeleteUser: () => void;
    handleSetModerator: () => void;
    handleRestrictUser: () => void;*/
}

const User = ({
  id,
  nickname,
  handleNewAdmin,
  handleChangeRole,
}: UserProps) => {
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
          <IconButton
            onClick={() => {
              handleNewAdmin({ id, nickname });
            }}
          >
            <CrownSimple size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`set ${nickname} as moderator`}>
          <IconButton
            onClick={() =>
              handleChangeRole({ id, nickname, role: ROLE.CHAT_ADMIN })
            }
          >
            <ArrowUp size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <UserMinus size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`delete ${nickname}`}>
          <IconButton>
            <X size={18} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default User;
