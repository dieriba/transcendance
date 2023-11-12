import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Eraser, Notebook } from "phosphor-react";
import { useState } from "react";
import EditGroup from "./EditGroup";

interface AdminProps {
  nickname: string;
  //handleEditChatroom: () => void;
}

const Admin = ({ nickname }: AdminProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Stack
        width="100%"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>{nickname}</Typography>
        <Stack direction="row">
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
        </Stack>
      </Stack>
      {open && <EditGroup open={open} handleClose={() => setOpen(false)} />}
    </>
  );
};

export default Admin;
