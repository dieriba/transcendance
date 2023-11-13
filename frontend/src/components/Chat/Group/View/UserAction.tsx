import { Tooltip, IconButton } from "@mui/material";
import {
  Notebook,
  GameController,
  CrownSimple,
  UserMinus,
  X,
  ArrowUp,
} from "phosphor-react";
import { ChatRoleType, ROLE } from "../../../../models/type-enum/typesEnum";

interface UserActionProps {
  role: ChatRoleType;
  nickname: string;
  me: boolean;
  id: string;
  handleNewAdmin: (data: { id: string; nickname: string }) => void;
  handleRestrict: (data: { id: string; nickname: string }) => void;
  handleChangeRole: (data: {
    id: string;
    nickname: string;
    role: ChatRoleType;
  }) => void;
}

const UserAction = ({
  role,
  nickname,
  id,
  me,
  handleChangeRole,
  handleNewAdmin,
  handleRestrict,
}: UserActionProps) => {
  if (role === "DIERIBA") {
    return (
      <>
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
          <IconButton onClick={() => handleRestrict({ id, nickname })}>
            <UserMinus size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`delete ${nickname}`}>
          <IconButton>
            <X size={18} />
          </IconButton>
        </Tooltip>
      </>
    );
  } else if (role === "CHAT_ADMIN") {
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
        <Tooltip title={`restrict ${nickname}`}>
          <IconButton>
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  } else {
    return (
      <>
        {!me && (
          <Tooltip title={`play with ${nickname}`}>
            <IconButton>
              <GameController size={20} />
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

export default UserAction;
