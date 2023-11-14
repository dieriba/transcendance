import { Tooltip, IconButton } from "@mui/material";
import {
  Notebook,
  Eraser,
  GameController,
  UserCirclePlus,
  UserGear,
} from "phosphor-react";
import { ChatRoleType } from "../../../../models/type-enum/typesEnum";
import { useState } from "react";
import EditGroup from "./AdminView/EditGroup";

interface AdminActionProps {
  role: ChatRoleType;
  nickname: string;
  handleUnrestriction: (data: { nickname: string }) => void;
}

const AdminAction = ({
  role,
  nickname,
  handleUnrestriction,
}: AdminActionProps) => {
  const [open, setOpen] = useState(false);

  if (role === "DIERIBA") {
    return (
      <>
        <Tooltip placement="top" title="add new user">
          <IconButton onClick={() => setOpen(true)}>
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
          <IconButton onClick={() => setOpen(true)}>
            <Eraser size={20} />
          </IconButton>
        </Tooltip>
        {open && <EditGroup open={open} handleClose={() => setOpen(false)} />}
      </>
    );
  } else {
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
      </>
    );
  }
};

export default AdminAction;
