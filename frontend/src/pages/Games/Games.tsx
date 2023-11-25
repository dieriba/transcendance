import {
  Alert,
  AlertColor,
  Box,
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
import {useWindowSize} from "usehooks-ts"
import usePageSize from "../../services/custom-hooks/usePageSize";
import { ASPECT_RATIO, GAME_MARGIN } from "./constant";


const Games = () => {
  const { inQueue, waitingReady } = useAppSelector(
    (state: RootState) => state.pong
  );

  const {width,height} = usePageSize();
  const gameWidth = Math.min(
    width - 2 * GAME_MARGIN,
    (height - 2 * GAME_MARGIN) * ASPECT_RATIO
  );
  const gameHeight = gameWidth / ASPECT_RATIO;

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

  

  

  return (<Box width={"100%"} alignItems={"center"} height={"100%"} display={"flex"} justifyContent={"center"}>
    <Canvas width={gameWidth} height={gameHeight} />
  </Box>)
  ;
};

export default Games;
