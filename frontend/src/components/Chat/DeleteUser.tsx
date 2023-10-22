import {
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DialogI, { DialogProps } from "../Dialog/DialogI";

interface DeleteUserProps extends DialogProps {}

const DeleteUser = ({ open, handleClose }: DeleteUserProps) => {
  return (
    <DialogI open={open} handleClose={handleClose}>
      <DialogTitle>{"Delete User?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Do you really want to delete that user ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </DialogI>
  );
};

export default DeleteUser;
