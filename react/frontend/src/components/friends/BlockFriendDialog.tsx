import { useBlockFriendMutation } from "../../redux/features/friends/friends.api.slice";
import { BaseFriendTypeWithChatroom } from "../../services/type";
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

  const handleBlockUser = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      await blockUser({ friendId }).unwrap();

      handleClose();
    } catch (error) {
      console.log(error);
      handleClose();
    }
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
