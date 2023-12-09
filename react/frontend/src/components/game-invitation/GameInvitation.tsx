import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogProps,
  AlertColor,
  Alert,
  Stack,
} from "@mui/material";
import DialogI from "../Dialog/DialogI";
import { useState } from "react";
import { SocketServerErrorResponse } from "../../services/type";
import { useSendGameInvitationMutation } from "../../redux/features/pong/pong.api.slice";
import { GameInvitationType } from "../../models/PongSchema";
import { PongTypeNormal, PongTypeSpecial } from "../../../shared/constant";

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
  const handleOnClick = async (data: GameInvitationType) => {
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
      <Stack  alignItems={"center"}>
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
        <Stack p={3} width={"80%"} spacing={1}>
          <Button
            fullWidth
            onClick={() => {
              handleOnClick({ id, pongType: PongTypeNormal });
            }}
            disabled={isLoading}
            variant="contained"
            color="inherit"
            sx={{ textTransform: "capitalize" }}
          >
            Normal Game
          </Button>
          <Button
            fullWidth
            onClick={() => {
              handleOnClick({ id, pongType: PongTypeSpecial });
            }}
            disabled={isLoading}
            variant="contained"
            color="inherit"
            sx={{ textTransform: "capitalize" }}
          >
            Special Game
          </Button>
          <Button
            fullWidth
            onClick={handleClose}
            color="inherit"
            variant="contained"
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </DialogI>
  );
};

export default GameInvitation;
