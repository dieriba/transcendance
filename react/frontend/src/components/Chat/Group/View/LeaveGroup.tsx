import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogProps,
  AlertColor,
  Alert,
} from "@mui/material";
import { BaseChatroomWithUserIdType } from "../../../../models/groupChat";
import DialogI from "../../../Dialog/DialogI";
import { useAppDispatch } from "../../../../redux/hooks";
import { useState } from "react";
import { leaveChatroom } from "../../../../redux/features/groups/group.slice";
import { SocketServerErrorResponse } from "../../../../services/type";
import { useLeaveGroupMutation } from "../../../../redux/features/groups/group.api.slice";

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
  const [leaveGroup, { isLoading }] = useLeaveGroupMutation();
  const dispatch = useAppDispatch();
  const handleOnClick = async (data: BaseChatroomWithUserIdType) => {
    try {
      data.id = id;
      data.chatroomId = chatroomId;
      const res = await leaveGroup(data).unwrap();

      dispatch(leaveChatroom(res.data));
      setMessage(res.message);
      setOpenSnack(true);
      setSeverity("success");
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  return (
    <DialogI open={open} handleClose={handleClose}>
      <DialogTitle>{`Leave ${chatroomName} ?`}</DialogTitle>
      <DialogContent>
        {openSnack && (
          <Alert
            onClose={handleCloseSnack}
            severity={severity}
            sx={{ width: "100%" }}
          >
            {message}
          </Alert>
        )}
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
