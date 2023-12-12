import {
  Stack,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import DialogI from "../../Dialog/DialogI";
import { useEffect } from "react";
import {
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  useAcceptGroupInvitaionMutation,
  useDeclineGroupInvitationMutation,
  useGetAllGroupInvitationQuery,
} from "../../../redux/features/groups/group.api.slice";
import {
  addNewChatroom,
  setGroupInvitation,
  deleteGroupInvitation,
} from "../../../redux/features/groups/group.slice";
import { connectSocket, socket } from "../../../utils/getSocket";
import { ChatEventGroup } from "../../../../shared/socket.event";
import { BaseChatroomTypeId } from "../../../models/groupChat";
import { RootState } from "../../../redux/store";
import GroupIcon from "./GroupIcon";
import { Plus, X } from "phosphor-react";
import { showSnackBar } from "../../../redux/features/app/app.slice";

interface GroupInvitationProps {
  open: boolean;
  handleClose: () => void;
}

const GroupInvitation = ({ open, handleClose }: GroupInvitationProps) => {
  const [acceptGroupInvitation, acceptGroupInvitationAction] =
    useAcceptGroupInvitaionMutation();
  const [declineGroupInvitation, declineGroupInvitationAction] =
    useDeclineGroupInvitationMutation();

  const { data, isLoading, isError } = useGetAllGroupInvitationQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setGroupInvitation(data.data));
      connectSocket();

      socket.on(
        ChatEventGroup.DELETE_GROUP_INVITATION,
        (data: SocketServerSucessResponse & { data: BaseChatroomTypeId }) => {
          dispatch(deleteGroupInvitation(data.data.chatroomId));
        }
      );

      return () => {
        socket.off(ChatEventGroup.DELETE_GROUP_INVITATION);
      };
    }
  }, [data, dispatch]);
  const handleOnclick = async (chatroomId: string) => {
    try {
      const res = await acceptGroupInvitation({
        chatroomId,
      }).unwrap();
      dispatch(deleteGroupInvitation(chatroomId));
      dispatch(addNewChatroom({ ...res.data, restrictedUsers: [] }));
      dispatch(showSnackBar({ message: res.message }));
    } catch (error) {
      dispatch(
        showSnackBar({
          message: (error as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
    }
  };

  const handleDeclineGroupInvitation = async (chatroomId: string) => {
    try {
      const res = await declineGroupInvitation({
        chatroomId,
      }).unwrap();
      dispatch(deleteGroupInvitation(chatroomId));
      dispatch(showSnackBar({ message: res.message }));
    } catch (error) {
      dispatch(
        showSnackBar({
          message: (error as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
    }
  };
  const groupInvitation = useAppSelector(
    (state: RootState) => state.groups.groupInvitation
  );

  if (isLoading) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <CircularProgress size={100} />
      </Stack>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
    const disabled =
      acceptGroupInvitationAction.isLoading ||
      declineGroupInvitationAction.isLoading;

    return (
      <>
        <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
          <DialogTitle>Group Invitation</DialogTitle>
          <DialogContent>
            <Stack p={2}>
              {groupInvitation.length === 0 ? (
                <Stack alignItems="center" justifyContent="center">
                  <Typography>No Group Invitation</Typography>
                </Stack>
              ) : (
                groupInvitation.map(
                  ({ chatroom: { id, chatroomName, type } }, index) => {
                    return (
                      <Stack
                        key={index}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <GroupIcon size={30} type={type} />
                        <Typography>{chatroomName}</Typography>
                        <Stack
                          direction={"row"}
                          alignContent={"center"}
                          spacing={2}
                        >
                          <Button
                            onClick={() => handleOnclick(id)}
                            startIcon={<Plus />}
                            disabled={disabled}
                            color="inherit"
                            variant="contained"
                          >
                            Join
                          </Button>
                          <Button
                            onClick={() => handleDeclineGroupInvitation(id)}
                            startIcon={<X />}
                            disabled={disabled}
                            variant="contained"
                            color="error"
                          >
                            Decline
                          </Button>
                        </Stack>
                      </Stack>
                    );
                  }
                )
              )}
            </Stack>
          </DialogContent>
        </DialogI>
      </>
    );
  }
};

export default GroupInvitation;
