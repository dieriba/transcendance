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
import { UserData, Open } from "./View";

interface UserActionProps {
  role: ChatRoleType;
  nickname: string;
  me: boolean;
  id: string;
  handleAction: (userData: Partial<UserData>, open: Partial<Open>) => void;
  userRole: ChatRoleType;
}

const UserAction = ({
  role,
  nickname,
  id,
  me,
  handleAction,
  userRole,
}: UserActionProps) => {
  if (role === "DIERIBA") {
    return (
      <>
        <Tooltip placement="top" title={`play with ${nickname}`}>
          <IconButton
            onClick={() =>
              handleAction({ id, nickname }, { gameInvitation: true })
            }
          >
            <GameController size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip
          onClick={() =>
            handleAction({ id, role: userRole }, { details: true })
          }
          placement="top"
          title={`${nickname} details`}
        >
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`set ${nickname} as chat admin`}>
          <IconButton
            onClick={() => {
              handleAction({ id, nickname }, { admin: true });
            }}
          >
            <CrownSimple size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`set ${nickname} as moderator`}>
          <IconButton
            onClick={() =>
              handleAction(
                { id, nickname, role: ROLE.CHAT_ADMIN },
                { role: true }
              )
            }
          >
            <ArrowUp size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`restrict ${nickname}`}>
          <IconButton
            onClick={() =>
              handleAction({ id, nickname }, { restriction: true })
            }
          >
            <UserMinus size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`kick ${nickname}`}>
          <IconButton
            onClick={() => handleAction({ id, nickname }, { kick: true })}
          >
            <X size={18} />
          </IconButton>
        </Tooltip>
      </>
    );
  } else if (role === "CHAT_ADMIN") {
    return (
      <>
        <Tooltip placement="top" title={`play with ${nickname}`}>
          <IconButton
            onClick={() =>
              handleAction({ id, nickname }, { gameInvitation: true })
            }
          >
            <GameController size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`${nickname} details`}>
          <IconButton
            onClick={() =>
              handleAction({ id, role: userRole }, { details: true })
            }
          >
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`restrict ${nickname}`}>
          <IconButton
            onClick={() =>
              handleAction({ id, nickname }, { restriction: true })
            }
          >
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
          <IconButton
            onClick={() =>
              handleAction({ id, role: userRole }, { details: true })
            }
          >
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  }
};

export default UserAction;
