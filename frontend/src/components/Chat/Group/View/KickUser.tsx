import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogProps,
  AlertColor,
  Alert,
} from "@mui/material";
import { BaseChatroomWithUserIdType } from "../../../../models/groupChat";
import DialogI from "../../../Dialog/DialogI";
import { useAppDispatch } from "../../../../redux/hooks";
import { useState } from "react";
import { removeUser } from "../../../../redux/features/groups/group.slice";
import { SocketServerErrorResponse } from "../../../../services/type";
import { useKickUserMutation } from "../../../../redux/features/groups/group.api.slice";

interface KickUserProps extends DialogProps {
  id: string;
  nickname: string;
  chatroomId: string;
  handleClose: () => void;
}

const KickUser = ({
  handleClose,
  open,
  id,
  nickname,
  chatroomId,
}: KickUserProps) => {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };
  const [kickUser, { isLoading }] = useKickUserMutation();
  const dispatch = useAppDispatch();
  const handleOnClick = async (data: BaseChatroomWithUserIdType) => {
    try {
      data.id = id;
      data.chatroomId = chatroomId;
      const res = await kickUser(data).unwrap();

      dispatch(removeUser(res.data));
      handleClose();
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  return (
    <DialogI open={open} handleClose={handleClose}>
      <DialogTitle>{`Kick ${nickname} ?`}</DialogTitle>
      <DialogContent>
        {openSnack && (
          <Alert
            onClose={handleCloseSnack}
            severity={severity}
            sx={{ width: "100%" }}
          >
            {message}
          </Alert>
        )}
        <DialogContentText id="alert-dialog-slide-description">
          {`Do you really wanna kick ${nickname} ?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          onClick={() => {
            handleOnClick({ id, chatroomId });
          }}
          disabled={isLoading}
          variant="contained"
          color="inherit"
        >
          Yes
        </Button>
        <Button
          fullWidth
          onClick={handleClose}
          color="inherit"
          variant="contained"
        >
          No
        </Button>
      </DialogActions>
    </DialogI>
  );
};

export default KickUser;
