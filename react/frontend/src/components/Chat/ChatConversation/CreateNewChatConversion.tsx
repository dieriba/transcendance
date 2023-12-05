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
import { setChatableUser } from "../../../redux/features/chat/chat.slice";
import { useGetAllChatableUserQuery } from "../../../redux/features/chat/chats.api.slice";
import { SocketServerErrorResponse } from "../../../services/type";
import DialogI from "../../Dialog/DialogI";
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
    }
  }, [data, dispatch]);

  const chatableUsers = useAppSelector(
    (state: RootState) => state.chat.chatableUsers
  );

  const handleSubmit = async (id: string) => {
    try {
      setOpenSnack(true);
      setSeverity("success");
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
                        onClick={() => handleSubmit(id)}
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
