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
  handleKickUser: (data: { id: string; nickname: string }) => void;
  handleNewAdmin: (data: { id: string; nickname: string }) => void;
  handleRestriction: (data: { id: string; nickname: string }) => void;
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
  handleRestriction,
  handleKickUser,
}: UserActionProps) => {
  if (role === "DIERIBA") {
    return (
      <>
        <Tooltip placement="top" title={`play with ${nickname}`}>
          <IconButton>
            <GameController size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`${nickname} details`}>
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`set ${nickname} as chat admin`}>
          <IconButton
            onClick={() => {
              handleNewAdmin({ id, nickname });
            }}
          >
            <CrownSimple size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`set ${nickname} as moderator`}>
          <IconButton
            onClick={() =>
              handleChangeRole({ id, nickname, role: ROLE.CHAT_ADMIN })
            }
          >
            <ArrowUp size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`restrict ${nickname}`}>
          <IconButton onClick={() => handleRestriction({ id, nickname })}>
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`kick ${nickname}`}>
          <IconButton onClick={() => handleKickUser({ id, nickname })}>
            <X size={18} />
          </IconButton>
        </Tooltip>
      </>
    );
  } else if (role === "CHAT_ADMIN") {
    return (
      <>
        <Tooltip placement="top" title={`play with ${nickname}`}>
          <IconButton>
            <GameController size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`${nickname} details`}>
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`restrict ${nickname}`}>
          <IconButton onClick={() => handleRestriction({ id, nickname })}>
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  } else {
    return (
      <>
        {!me && (
          <Tooltip placement="top" title={`play with ${nickname}`}>
            <IconButton>
              <GameController size={20} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip placement="top" title={`${nickname} details`}>
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  }
};

export default UserAction;
