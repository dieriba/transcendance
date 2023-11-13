import { Tooltip, IconButton } from "@mui/material";
import { Notebook, Eraser, GameController, UserCirclePlus, UserGear } from "phosphor-react";
import { ChatRoleType } from "../../../../models/type-enum/typesEnum";
import { useState } from "react";
import EditGroup from "./AdminView/EditGroup";

interface AdminActionProps {
  role: ChatRoleType;
  nickname: string;
}

const AdminAction = ({ role, nickname }: AdminActionProps) => {
  const [open, setOpen] = useState(false);

  if (role === "DIERIBA") {
    return (
      <>
        <Tooltip title="add new user">
          <IconButton onClick={() => setOpen(true)}>
            <UserCirclePlus size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="unrestrict user">
          <IconButton onClick={() => setOpen(true)}>
            <UserGear size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`${nickname} details`}>
          <IconButton>
            <Notebook size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="edit chatroom">
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
      </>
    );
  }
};

export default AdminAction;
