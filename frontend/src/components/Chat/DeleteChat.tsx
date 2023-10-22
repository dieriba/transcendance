import {
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DialogI, { DialogProps } from "../Dialog/DialogI";

interface DeleteChatProps extends DialogProps {}

const DeleteChat = ({ open, handleClose }: DeleteChatProps) => {
  return (
    <DialogI open={open} handleClose={handleClose}>
      <DialogTitle>{"Delete Chat?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Do you really want to delete that chat ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </DialogI>
  );
};

export default DeleteChat;
