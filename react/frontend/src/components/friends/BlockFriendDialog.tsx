import { showSnackBar } from "../../redux/features/app/app.slice";
import { useBlockFriendMutation } from "../../redux/features/friends/friends.api.slice";
import { useAppDispatch } from "../../redux/hooks";
import {
  BaseFriendTypeWithChatroom,
  SocketServerErrorResponse,
} from "../../services/type";
import CustomDialog from "../Dialog/CustomDialog";
import { DialogProps } from "../Dialog/DialogI";

interface BlockUserDialogProps extends DialogProps {
  nickname: string;
  friendId: string;
}

const BlockUserDialog = ({
  open,
  handleClose,
  nickname,
  friendId,
}: BlockUserDialogProps) => {
  const [blockUser] = useBlockFriendMutation();
  const dispatch = useAppDispatch();
  const handleBlockUser = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      const res = await blockUser({ friendId }).unwrap();
      dispatch(
        showSnackBar({
          message: res.message,
        })
      );
    } catch (error) {
      dispatch(
        showSnackBar({
          message: (error as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
    }
    handleClose();
  };

  return (
    <CustomDialog
      handleOnClick={handleBlockUser}
      open={open}
      handleClose={handleClose}
      title={`Block ${nickname} ?`}
      content={`Do you really want to block ${nickname} ?`}
      friendId={friendId}
    />
  );
};

export default BlockUserDialog;
