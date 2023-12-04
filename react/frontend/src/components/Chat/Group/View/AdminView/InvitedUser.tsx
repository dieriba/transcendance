import {
  Stack,
  Alert,
  AlertColor,
  CircularProgress,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { RootState } from "../../../../../redux/store";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import {
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../../../services/type";
import {
  useCancelGroupInvitationMutation,
  useGetAllInvitedUserQuery,
} from "../../../../../redux/features/groups/group.api.slice";
import {
  deleteInvitedUser,
  setInvitedUser,
} from "../../../../../redux/features/groups/group.slice";
import { X } from "phosphor-react";
import { socket } from "../../../../../utils/getSocket";
import { ChatEventGroup } from "../../../../../../shared/socket.event";
import { BaseUserTypeId } from "../../../../../models/login/UserSchema";

const InvitedUser = () => {
  const { currentGroupChatroomId, invitedUser } = useAppSelector(
    (state: RootState) => state.groups
  );
  const chatroomId = currentGroupChatroomId as string;
  const { data, isLoading, isError } = useGetAllInvitedUserQuery(chatroomId, {
    refetchOnMountOrArgChange: true,
  });
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const dispatch = useAppDispatch();
  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  useEffect(() => {
    if (data?.data) {
      dispatch(setInvitedUser(data.data));
      if (!socket) return;

      socket.on(
        ChatEventGroup.USER_DECLINED_INVITATION,
        (data: SocketServerSucessResponse & { data: BaseUserTypeId }) => {
          dispatch(deleteInvitedUser(data.data.id));
        }
      );

      return () => {
        socket.off(ChatEventGroup.USER_DECLINED_INVITATION);
      };
    }
  }, [data, dispatch]);

  const [cancelGroupInvitation, cancelGroupInvitationAction] =
    useCancelGroupInvitationMutation();

  const handleSubmit = async (id: string) => {
    try {
      const res = await cancelGroupInvitation({ id, chatroomId }).unwrap();
      dispatch(deleteInvitedUser(id));
      setMessage(res.message);
      setOpenSnack(true);
      setSeverity("success");
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  if (isLoading) {
    <Stack p={3} sx={{ width: "100%" }} justifyContent="center">
      <CircularProgress />
    </Stack>;
  } else if (isError || !data) {
    <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
      <Typography>An error has occured</Typography>
    </Stack>;
  } else {
    return (
      <>
        <Stack
          sx={{ backgroundColor: theme.palette.background.paper }}
          width="100%"
          p={2}
        >
          <Stack spacing={2}>
            {openSnack && (
              <Alert
                onClose={handleCloseSnack}
                severity={severity}
                sx={{ width: "100%" }}
              >
                {message}
              </Alert>
            )}
            {invitedUser.length === 0 ? (
              <Stack
                width="100%"
                p={3}
                justifyContent="center"
                alignContent="center"
              >
                <Typography variant="body2">No Invited User</Typography>
              </Stack>
            ) : (
              invitedUser.map((user, index) => (
                <Stack
                  key={index}
                  width="100%"
                  alignItems="center"
                  p={3}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Avatar src="" />
                  <Typography>{user.user.nickname}</Typography>
                  <Tooltip title="Cancel group invitation">
                    <IconButton
                      onClick={() => handleSubmit(user.user.id)}
                      disabled={cancelGroupInvitationAction.isLoading}
                    >
                      <X />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </>
    );
  }
};

export default InvitedUser;
