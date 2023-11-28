import {
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DialogI, { DialogProps } from "../Dialog/DialogI";

interface BlockUserProps extends DialogProps {}

const BlockUser = ({ open, handleClose }: BlockUserProps) => {
  return (
    <DialogI open={open} handleClose={handleClose}>
      <DialogTitle>{"Block User?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Do you really want to block that user ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </DialogI>
  );
};

export default BlockUser;
