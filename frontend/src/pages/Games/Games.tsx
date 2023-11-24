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

const Games = () => {
  const [status, setStatus] = useState<{
    inQueue: boolean;
    waitingRoom: boolean;
    gameId: string | undefined;
  }>({
    waitingRoom: false,
    inQueue: false,
    gameId: undefined,
  });

  useEffect(() => {
    connectSocket();
    socket.on(PongEvent.GO_WAITING_ROOM, (data) => {
      console.log(data);
    });
    return () => {
      socket.off(PongEvent.GO_WAITING_ROOM);
      console.log(status.gameId);

      if (status.gameId) socket.emit(PongEvent.LEAVE_QUEUE);
    };
  }, [status.gameId]);

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

      setStatus((prev) => ({
        ...prev,
        inQueue: true,
        gameId: res.data.gameId,
      }));
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
      setStatus((prev) => ({ ...prev, inQueue: false, gameId: undefined }));
    } catch (error) {
      console.log({ error });

      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  if (!status.inQueue) {
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
  } else if (status.inQueue && !status.waitingRoom) {
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
