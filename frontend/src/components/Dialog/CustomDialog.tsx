import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DialogI, { DialogProps } from "./DialogI";
import { BaseFriendTypeWithChatroom } from "../../services/type";

interface CustomDialogProps extends DialogProps {
  handleOnClick: (friend: BaseFriendTypeWithChatroom) => void;
  content: string;
  title: string;
  friendId: string;
  chatroomId?: string;
}

const CustomDialog = ({
  handleClose,
  handleOnClick,
  content,
  title,
  open,
  friendId,
  chatroomId,
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
            handleOnClick({ friendId, chatroomId });
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
