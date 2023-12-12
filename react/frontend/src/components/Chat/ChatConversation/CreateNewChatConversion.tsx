import {
  Stack,
  DialogContent,
  Alert,
  AlertColor,
  CircularProgress,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import {
  addChatableUser,
  addNewChatroom,
  removeChatableUser,
  setChatableUser,
  setPrivateChatroomId,
} from "../../../redux/features/chat/chat.slice";
import {
  useCreatePrivateChatroomMutation,
  useGetAllChatableUserQuery,
} from "../../../redux/features/chat/chats.api.slice";
import {
  SocketServerErrorResponse,
  SocketServerSucessResponse,
} from "../../../services/type";
import DialogI from "../../Dialog/DialogI";
import { Basetype } from "../../../models/BaseType";
import { connectSocket, socket } from "../../../utils/getSocket";
import { GeneralEvent } from "../../../../shared/socket.event";
import { BaseUserInfoType } from "../../../models/login/UserSchema";

interface CreateNewChatConversationProps {
  open: boolean;
  handleClose: () => void;
}

const CreateNewChatConversation = ({
  open,
  handleClose,
}: CreateNewChatConversationProps) => {
  const { data, isLoading, isError } = useGetAllChatableUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const theme = useTheme();
  const [createNewChat] = useCreatePrivateChatroomMutation();
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
      dispatch(setChatableUser(data.data));

      connectSocket();

      socket.on(
        GeneralEvent.REMOVE_BLOCKED_USER,
        (data: SocketServerSucessResponse & { data: BaseUserInfoType }) => {
          dispatch(addChatableUser(data.data));
        }
      );

      socket.on(
        GeneralEvent.NEW_BLOCKED_USER,
        (data: SocketServerSucessResponse & { data: BaseUserInfoType }) => {
          dispatch(removeChatableUser(data.data.id));
        }
      );
    }
    return () => {
      socket.off(GeneralEvent.NEW_BLOCKED_USER);
      socket.off(GeneralEvent.REMOVE_BLOCKED_USER);
    };
  }, [data, dispatch]);

  const { chatableUsers, privateChatroom } = useAppSelector(
    (state: RootState) => state.chat
  );

  const handleSubmit = async ({ id }: Basetype) => {
    try {
      const { data } = await createNewChat({ id }).unwrap();
      const userId = data?.users[0].user.id;
      const chatroom = privateChatroom.find(
        (chatroom) => chatroom.users[0].user.id === userId
      );

      if (chatroom) {
        dispatch(setPrivateChatroomId(chatroom.id));
        handleClose();
        return;
      }

      dispatch(addNewChatroom(data));
      dispatch(setPrivateChatroomId(data.id));
      handleClose();
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  if (isLoading) {
    return (
      <Stack p={3} sx={{ width: "100%" }} justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
    return (
      <>
        <DialogI maxWidth="md" open={open} handleClose={handleClose}>
          <DialogContent
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
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
                {chatableUsers.length === 0 ? (
                  <Stack
                    width="100%"
                    p={3}
                    justifyContent="center"
                    alignContent="center"
                  >
                    <Typography variant="body2">
                      No user to chat yet!
                    </Typography>
                  </Stack>
                ) : (
                  chatableUsers.map(({ id, nickname, profile }, index) => (
                    <Stack
                      key={index}
                      width="100%"
                      alignItems="center"
                      p={3}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Avatar
                        src={profile?.avatar ? profile.avatar : undefined}
                      />
                      <Typography>{nickname}</Typography>
                      <Button
                        onClick={() => handleSubmit({ id })}
                        variant="contained"
                        color="inherit"
                      >
                        {`Send Message to ${nickname}`}
                      </Button>
                    </Stack>
                  ))
                )}
              </Stack>
            </Stack>
          </DialogContent>
        </DialogI>
      </>
    );
  }
};

export default CreateNewChatConversation;
