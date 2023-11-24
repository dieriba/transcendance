import {
  Alert,
  AlertColor,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import {
  useJoinQueueMutation,
  useLeaveQueueMutation,
} from "../../redux/features/pong/pong.api.slice";
import { SocketServerErrorResponse } from "../../services/type";
import { connectSocket, socket } from "../../utils/getSocket";
import { PongEvent } from "../../../../shared/socket.event";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { setInQueue } from "../../redux/features/pong/pong.slice";

const Games = () => {
  const { inQueue, waitingReady } = useAppSelector(
    (state: RootState) => state.pong
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    connectSocket();
    socket.on(PongEvent.GO_WAITING_ROOM, (data) => {
      console.log(data);
    });
    return () => {
      socket.off(PongEvent.GO_WAITING_ROOM);
    };
  }, []);

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

      dispatch(setInQueue(true));
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
      dispatch(setInQueue(false));
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
  } else if (inQueue && !waitingReady) {
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
  }

  return <Canvas />;
};

export default Games;
