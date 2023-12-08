import { useUnblockFriendMutation } from "../../redux/features/friends/friends.api.slice";
import { BaseFriendTypeWithChatroom } from "../../services/type";
import CustomDialog from "../Dialog/CustomDialog";
import { DialogProps } from "../Dialog/DialogI";

interface UnblockUserDialogProps extends DialogProps {
  nickname: string;
  friendId: string;
}

const UnblockUserDialog = ({
  open,
  handleClose,
  nickname,
  friendId,
}: UnblockUserDialogProps) => {
  const [unblockUser] = useUnblockFriendMutation();

  const handleUnblockUser = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      await unblockUser({ friendId }).unwrap();

    } catch (error) {
      /** */
    }
    handleClose();
  };

  return (
    <CustomDialog
      handleOnClick={handleUnblockUser}
      open={open}
      handleClose={handleClose}
      title={`Block ${nickname} ?`}
      content={`Do you really want to unblock ${nickname} ?`}
      friendId={friendId}
    />
  );
};

export default UnblockUserDialog;
