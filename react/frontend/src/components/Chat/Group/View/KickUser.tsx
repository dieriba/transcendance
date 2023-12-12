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
import { removeUser } from "../../../../redux/features/groups/group.slice";
import { SocketServerErrorResponse } from "../../../../services/type";
import { useKickUserMutation } from "../../../../redux/features/groups/group.api.slice";
import { showSnackBar } from "../../../../redux/features/app/app.slice";

interface KickUserProps extends DialogProps {
  id: string;
  nickname: string;
  chatroomId: string;
  handleClose: () => void;
}

const KickUser = ({
  handleClose,
  open,
  id,
  nickname,
  chatroomId,
}: KickUserProps) => {
  const [kickUser, { isLoading }] = useKickUserMutation();
  const dispatch = useAppDispatch();
  const handleOnClick = async (data: BaseChatroomWithUserIdType) => {
    try {
      data.id = id;
      data.chatroomId = chatroomId;
      const res = await kickUser(data).unwrap();

      dispatch(removeUser({ data: res.data, chatroomId }));
      handleClose();
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
      <DialogTitle>{`Kick ${nickname} ?`}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {`Do you really wanna kick ${nickname} ?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          onClick={() => {
            handleOnClick({ id, chatroomId });
          }}
          disabled={isLoading}
          variant="contained"
          color="inherit"
        >
          Yes
        </Button>
        <Button
          fullWidth
          onClick={handleClose}
          color="inherit"
          variant="contained"
        >
          No
        </Button>
      </DialogActions>
    </DialogI>
  );
};

export default KickUser;
