import { useDeleteFriendMutation } from "../../redux/features/friends/friends.api.slice";
import { BaseFriendTypeWithChatroom } from "../../services/type";
import CustomDialog from "../Dialog/CustomDialog";
import { DialogProps } from "../Dialog/DialogI";

interface DeleteFriendDialogProps extends DialogProps {
  nickname: string;
  friendId: string;
}

const DeleteFriendDialog = ({
  open,
  handleClose,
  nickname,
  friendId,
}: DeleteFriendDialogProps) => {
  const handleDeleteFriend = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      await deleteFriend({ friendId }).unwrap();
    } catch (error) {
      /** */
    }
    handleClose();
  };
  const [deleteFriend] = useDeleteFriendMutation();

  return (
    <CustomDialog
      handleOnClick={handleDeleteFriend}
      open={open}
      handleClose={handleClose}
      title={`Delete ${nickname}`}
      content={`Do you really want to delete ${nickname} ?`}
      friendId={friendId}
    />
  );
};

export default DeleteFriendDialog;
