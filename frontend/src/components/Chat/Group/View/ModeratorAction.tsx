import { Tooltip, IconButton } from "@mui/material";
import {
  Notebook,
  GameController,
  ArrowDown,
  CrownSimple,
  UserMinus,
  X,
  UserGear,
} from "phosphor-react";
import { ChatRoleType, ROLE } from "../../../../models/type-enum/typesEnum";

interface ModeratorActionProps {
  role: ChatRoleType;
  nickname: string;
  me: boolean;
  id: string;
  handleRestriction: (data: { id: string; nickname: string }) => void;
  handleNewAdmin: (data: { id: string; nickname: string }) => void;
  handleChangeRole: (data: {
    id: string;
    nickname: string;
    role: ChatRoleType;
  }) => void;
}

const ModeratorAction = ({
  role,
  nickname,
  id,
  me,
  handleChangeRole,
  handleNewAdmin,
  handleRestriction,
}: ModeratorActionProps) => {
  if (role === "DIERIBA") {
    return (
      <>
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
          <IconButton onClick={() => handleRestriction({ id, nickname })}>
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`delete ${nickname}`}>
          <IconButton>
            <X size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  } else {
    return (
      <>
        {!me ? (
          <Tooltip title={`play with ${nickname}`}>
            <IconButton>
              <GameController size={20} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="unrestrict user">
            <IconButton>
              <UserGear size={20} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={`${nickname} details`}>
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  }
};

export default ModeratorAction;
