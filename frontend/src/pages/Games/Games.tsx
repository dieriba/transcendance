import {
  Alert,
  AlertColor,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  useJoinQueueMutation,
  useLeaveQueueMutation,
} from "../../redux/features/pong/pong.api.slice";
import { SocketServerErrorResponse } from "../../services/type";

const Games = () => {
  const [inQueue, setInQueue] = useState(false);

  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);

  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const [joinQueue, { isLoading }] = useJoinQueueMutation();
  const [leaveQueue, leaveQueueAction] = useLeaveQueueMutation();

  const handleJoinQueue = async () => {
    try {
      const res = await joinQueue().unwrap();
      console.log({ gameId: res.data.gameId });

      setInQueue(true);
    } catch (error) {
      console.log({ error });

      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await leaveQueue().unwrap();
      setInQueue(false);
    } catch (error) {
      console.log({ error });

      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  if (!inQueue) {
    return (
      <Stack
        height={"100vh"}
        width={"100%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Stack width={"300px"} spacing={1}>
          {openSnack && (
            <Alert
              onClose={handleCloseSnack}
              severity={severity}
              sx={{ width: "100%" }}
            >
              {message}
            </Alert>
          )}
          <Button
            disabled={isLoading}
            onClick={handleJoinQueue}
            variant="contained"
            color="inherit"
          >
            Join Queue
          </Button>
          <Button variant="contained" color="inherit">
            Spectate a game
          </Button>
        </Stack>
      </Stack>
    );
  }
  return (
    <Stack
      alignItems={"center"}
      justifyContent={"center"}
      height={"100vh"}
      width={"100%"}
      spacing={5}
    >
      <CircularProgress size={100} />
      <Typography>Please wait</Typography>
      <Button
        disabled={leaveQueueAction.isLoading}
        variant="contained"
        color="inherit"
        onClick={handleLeaveQueue}
      >
        Leave Queue
      </Button>
    </Stack>
  );
};

export default Games;
