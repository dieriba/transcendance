import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogProps,
  Stack,
} from "@mui/material";
import DialogI from "../Dialog/DialogI";
import { SocketServerErrorResponse } from "../../services/type";
import { useSendGameInvitationMutation } from "../../redux/features/pong/pong.api.slice";
import { GameInvitationType } from "../../models/PongSchema";
import { PongTypeNormal, PongTypeSpecial } from "../../../shared/constant";
import { showSnackBar } from "../../redux/features/app/app.slice";
import { useAppDispatch } from "../../redux/hooks";

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
  const dispatch = useAppDispatch();
  const handleOnClick = async (data: GameInvitationType) => {
    try {
      const res = await sendGameInvitation(data).unwrap();
      dispatch(
        showSnackBar({
          message: res.message,
        })
      );
    } catch (error) {
      dispatch(
        showSnackBar({
          message: (error as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
    }
  };

  return (
    <DialogI open={open} handleClose={handleClose}>
      <Stack alignItems={"center"}>
        <DialogTitle>{`Play with ${nickname} ?`}</DialogTitle>
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
