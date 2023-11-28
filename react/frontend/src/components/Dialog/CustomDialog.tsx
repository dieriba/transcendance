import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DialogI, { DialogProps } from "./DialogI";
import { BaseFriendType } from "../../models/FriendsSchema";

interface CustomDialogProps extends DialogProps {
  handleOnClick: (friend: BaseFriendType) => void;
  content: string;
  title: string;
  friendId: string;
}

const CustomDialog = ({
  handleClose,
  handleOnClick,
  content,
  title,
  open,
  friendId,
}: CustomDialogProps) => {
  return (
    <DialogI open={open} handleClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button
          onClick={() => {
            handleOnClick({ friendId });
            handleClose();
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </DialogI>
  );
};

export default CustomDialog;
