import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogProps,
} from "@mui/material";
import { BaseChatroomWithUserIdType } from "../../../../models/groupChat";
import DialogI from "../../../Dialog/DialogI";
import { useAppDispatch } from "../../../../redux/hooks";
import { leaveChatroom } from "../../../../redux/features/groups/group.slice";
import { SocketServerErrorResponse } from "../../../../services/type";
import { useLeaveGroupMutation } from "../../../../redux/features/groups/group.api.slice";
import { showSnackBar } from "../../../../redux/features/app/app.slice";

interface LeaveGroupProps extends DialogProps {
  id: string;
  chatroomId: string;
  chatroomName: string;
  handleClose: () => void;
}

const LeaveGroup = ({
  handleClose,
  open,
  id,
  chatroomName,
  chatroomId,
}: LeaveGroupProps) => {
  const [leaveGroup, { isLoading }] = useLeaveGroupMutation();
  const dispatch = useAppDispatch();
  const handleOnClick = async (data: BaseChatroomWithUserIdType) => {
    try {
      data.id = id;
      data.chatroomId = chatroomId;
      const res = await leaveGroup(data).unwrap();

      dispatch(leaveChatroom(res.data));
      dispatch(showSnackBar({ message: res.message }));
    } catch (error) {
      dispatch(
        showSnackBar({ message: (error as SocketServerErrorResponse).message })
      );
    }
  };

  return (
    <DialogI open={open} handleClose={handleClose}>
      <DialogTitle>{`Leave ${chatroomName} ?`}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {`Do you really wanna leave ${chatroomName} ?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button
          onClick={() => {
            handleOnClick({ id, chatroomId });
          }}
          disabled={isLoading}
        >
          Yes
        </Button>
      </DialogActions>
    </DialogI>
  );
};

export default LeaveGroup;
