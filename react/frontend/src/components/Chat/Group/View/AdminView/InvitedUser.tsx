import {
  Stack,
  CircularProgress,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
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
import { connectSocket, socket } from "../../../../../utils/getSocket";
import { ChatEventGroup } from "../../../../../../shared/socket.event";
import { Basetype } from "../../../../../models/BaseType";
import { showSnackBar } from "../../../../../redux/features/app/app.slice";

const InvitedUser = () => {
  const { currentGroupChatroomId, invitedUser } = useAppSelector(
    (state: RootState) => state.groups
  );
  const chatroomId = currentGroupChatroomId as string;
  const { data, isLoading, isError } = useGetAllInvitedUserQuery(chatroomId, {
    refetchOnMountOrArgChange: true,
  });
  const theme = useTheme();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data?.data) {
      dispatch(setInvitedUser(data.data));
      connectSocket();

      socket.on(
        ChatEventGroup.USER_DECLINED_INVITATION,
        (data: SocketServerSucessResponse & { data: Basetype }) => {
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
