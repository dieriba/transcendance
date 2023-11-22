import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DialogI from "../../components/Dialog/DialogI";

interface GameInviteProps {
  title: string;
  handleClose: () => void;
  user: string;
  open: boolean;
}

const GameInvite = ({ open, title, handleClose, user }: GameInviteProps) => {
  return (
    <>
      <DialogI open={open} handleClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {`${user} invited you to play a game ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button
            onClick={() => {
              handleClose();
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </DialogI>
    </>
  );
};

export default GameInvite;
