import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogProps,
  AlertColor,
  Alert,
  Stack,
} from "@mui/material";
import DialogI from "../Dialog/DialogI";
import { useState } from "react";
import { SocketServerErrorResponse } from "../../services/type";
import { BaseUserTypeId } from "../../models/login/UserSchema";
import { useSendGameInvitationMutation } from "../../redux/features/pong/pong.api.slice";

interface GameInvitationProps extends DialogProps {
  id: string;
  nickname: string;
  handleClose: () => void;
}

const GameInvitation = ({
  handleClose,
  open,
  id,
  nickname,
}: GameInvitationProps) => {
  const [sendGameInvitation, { isLoading }] = useSendGameInvitationMutation();
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
  const handleOnClick = async (data: BaseUserTypeId) => {
    try {
      const res = await sendGameInvitation(data).unwrap();
      setSeverity("success");
      setMessage(res.message);
      setOpenSnack(true);
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  return (
    <DialogI open={open} handleClose={handleClose}>
      <Stack alignItems={"center"}>
        <DialogTitle>{`Play with ${nickname} ?`}</DialogTitle>
        {openSnack && (
          <Alert
            onClose={handleCloseSnack}
            severity={severity}
            sx={{ maxWidth: "90%" }}
          >
            {message}
          </Alert>
        )}
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {`Send a game Invitation to ${nickname} ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            onClick={() => {
              handleOnClick({ id });
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
      </Stack>
    </DialogI>
  );
};

export default GameInvitation;
