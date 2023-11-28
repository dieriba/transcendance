import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DialogI, { DialogProps } from "./DialogI";
import { BaseChatroomWithUserIdType } from "../../models/groupChat";

interface CustomDialogGroupProps extends DialogProps {
  handleOnClick: (data: BaseChatroomWithUserIdType) => void;
  content: string;
  title: string;
  id: string;
  chatroomId: string;
}

const CustomDialogGroup = ({
  handleClose,
  handleOnClick,
  content,
  title,
  open,
  id,
  chatroomId,
}: CustomDialogGroupProps) => {
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
            handleOnClick({ id, chatroomId });
            handleClose();
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </DialogI>
  );
};

export default CustomDialogGroup;
