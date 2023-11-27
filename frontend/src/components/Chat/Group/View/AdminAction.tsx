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

interface AdminActionProps {
  role: ChatRoleType;
  nickname: string;
  id: string;
  type: GroupTypes;
  handleUnrestriction: (data: { nickname: string }) => void;
  handleGameInvitation: (data: { id: string; nickname: string }) => void;
}

const AdminAction = ({
  role,
  nickname,
  id,
  type,
  handleUnrestriction,
  handleGameInvitation,
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
          <IconButton onClick={() => handleUnrestriction({ nickname })}>
            <UserGear size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`${nickname} details`}>
          <IconButton>
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
          <IconButton onClick={() => handleGameInvitation({ id, nickname })}>
            <GameController size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={`${nickname} details`}>
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  }
};

export default AdminAction;
