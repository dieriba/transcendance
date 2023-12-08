import {
  Stack,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  Alert,
  AlertColor,
  Button,
} from "@mui/material";
import DialogI from "../../Dialog/DialogI";
import { useEffect, useState } from "react";
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

interface GroupInvitationProps {
  open: boolean;
  handleClose: () => void;
}

const GroupInvitation = ({ open, handleClose }: GroupInvitationProps) => {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const [acceptGroupInvitation, acceptGroupInvitationAction] =
    useAcceptGroupInvitaionMutation();
  const [declineGroupInvitation, declineGroupInvitationAction] =
    useDeclineGroupInvitationMutation();
  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

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
        ChatEventGroup.DELETE_USER_INVITATION,
        (data: SocketServerSucessResponse & { data: BaseChatroomTypeId }) => {
          dispatch(deleteGroupInvitation(data.data.chatroomId));
        }
      );

      return () => {
        socket.off(ChatEventGroup.DELETE_USER_INVITATION);
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
      setSeverity("success");
      setMessage(res.message);
      setOpenSnack(true);
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  const handleDeclineGroupInvitation = async (chatroomId: string) => {
    try {
      const res = await declineGroupInvitation({
        chatroomId,
      }).unwrap();
      dispatch(deleteGroupInvitation(chatroomId));
      setSeverity("success");
      setMessage(res.message);
      setOpenSnack(true);
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
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
            {openSnack && (
              <Alert
                onClose={handleCloseSnack}
                severity={severity}
                sx={{ width: "100%" }}
              >
                {message}
              </Alert>
            )}
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
