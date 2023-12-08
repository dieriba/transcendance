import { Tooltip, IconButton } from "@mui/material";
import {
  Notebook,
  Eraser,
  GameController,
  UserCirclePlus,
  UserGear,
} from "phosphor-react";
import {
  ChatRoleType,
  GroupTypes,
} from "../../../../models/type-enum/typesEnum";
import { useState } from "react";
import EditGroup from "./AdminView/EditGroup";
import AddUser from "./AdminView/AddOrInviteUser";
import { UserData, Open } from "./View";

interface AdminActionProps {
  role: ChatRoleType;
  nickname: string;
  id: string;
  type: GroupTypes;
  handleAction: (userData: Partial<UserData>, open: Partial<Open>) => void;
  userRole: ChatRoleType;
}

const AdminAction = ({
  role,
  nickname,
  id,
  type,
  handleAction,
  userRole,
}: AdminActionProps) => {
  const [open, setOpen] = useState<{ edit: boolean; addUser: boolean }>({
    edit: false,
    addUser: false,
  });

  if (role === "DIERIBA") {
    return (
      <>
        <Tooltip
          placement="top"
          title={type !== "PRIVATE" ? "add or invite user" : "invite user"}
        >
          <IconButton
            onClick={() => setOpen((prev) => ({ ...prev, addUser: true }))}
          >
            <UserCirclePlus size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title="unrestrict user">
          <IconButton
            onClick={() => handleAction({ nickname }, { unrestriction: true })}
          >
            <UserGear size={20} />
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
        <Tooltip placement="top" title="edit chatroom">
          <IconButton
            onClick={() => setOpen((prev) => ({ ...prev, edit: true }))}
          >
            <Eraser size={20} />
          </IconButton>
        </Tooltip>
        {open.edit && (
          <EditGroup
            open={open.edit}
            handleClose={() => setOpen((prev) => ({ ...prev, edit: false }))}
          />
        )}
        {open.addUser && (
          <AddUser
            open={open.addUser}
            handleClose={() => setOpen((prev) => ({ ...prev, addUser: false }))}
          />
        )}
      </>
    );
  } else {
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
      </>
    );
  }
};

export default AdminAction;
