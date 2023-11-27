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
import { UserData, Open } from "./View";

interface ModeratorActionProps {
  role: ChatRoleType;
  nickname: string;
  me: boolean;
  id: string;
  userRole: ChatRoleType;
  handleAction: (userData: Partial<UserData>, open: Partial<Open>) => void;
}

const ModeratorAction = ({
  role,
  nickname,
  id,
  userRole,
  me,
  handleAction,
}: ModeratorActionProps) => {
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
        <Tooltip placement="top" title={`${nickname} details`}>
          <IconButton
            onClick={() =>
              handleAction({ id, role: userRole }, { details: true })
            }
          >
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`set ${nickname} as chat admin`}>
          <IconButton
            onClick={() => handleAction({ id, nickname }, { admin: true })}
          >
            <CrownSimple size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`set ${nickname} as user`}>
          <IconButton
            onClick={() =>
              handleAction(
                { id, nickname, role: ROLE.REGULAR_USER },
                { role: true }
              )
            }
          >
            <ArrowDown size={20} />
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
            <X size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  } else {
    return (
      <>
        {!me ? (
          <Tooltip placement="top" title={`play with ${nickname}`}>
            <IconButton
              onClick={() =>
                handleAction({ id, nickname }, { gameInvitation: true })
              }
            >
              <GameController size={20} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip placement="top" title="unrestrict user">
            <IconButton
              onClick={() =>
                handleAction({ nickname }, { unrestriction: true })
              }
            >
              <UserGear size={20} />
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

export default ModeratorAction;
