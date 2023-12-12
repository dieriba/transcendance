import { Alert, AlertColor, Button, Stack } from "@mui/material";
import { useState } from "react";
import {
  useJoinBackCurrentGameMutation,
  useJoinQueueMutation,
} from "../../redux/features/pong/pong.api.slice";
import { SocketServerErrorResponse } from "../../services/type";
import {
  PongGameType,
  PongTypeNormal,
  PongTypeSpecial,
} from "../../../shared/constant";
import WaitingQueue from "./WaitingQueue";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { showSnackBar } from "../../redux/features/app/app.slice";
import { setGameData } from "../../redux/features/pong/pong.slice";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";

const Games = () => {
  const [open, setOpen] = useState<{ queue: boolean }>({ queue: false });
  const gameData = useAppSelector((state: RootState) => state.pong.gameData);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const navigate = useNavigate();
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
  const dispatch = useAppDispatch();
  const [joinBackGame, joinBackMutation] = useJoinBackCurrentGameMutation();
  const handleJoinQueue = async (data: { pongType: PongGameType }) => {
    try {
      await joinQueue(data).unwrap();

      setOpen((prev) => ({ ...prev, queue: true }));
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  const handleJoinBackGame = async (data: { gameId: string }) => {
    try {
      await joinBackGame(data).unwrap();
      navigate(PATH_APP.dashboard.pong, { replace: true });
    } catch (error) {
      dispatch(
        showSnackBar({
          message: (error as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
      dispatch(setGameData(undefined));
    }
  };

  return (
    <>
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
          {gameData && (
            <Button
              disabled={joinBackMutation.isLoading}
              onClick={() => {
                handleJoinBackGame({ gameId: gameData.room });
              }}
              variant="contained"
              color="inherit"
            >
              JOIN BACK GAME
            </Button>
          )}

          <Button
            disabled={isLoading}
            onClick={() => handleJoinQueue({ pongType: PongTypeNormal })}
            variant="contained"
            color="inherit"
          >
            Join Queue
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => handleJoinQueue({ pongType: PongTypeSpecial })}
            variant="contained"
            color="inherit"
          >
            Join Special Queue
          </Button>
        </Stack>
      </Stack>
      {open.queue && (
        <WaitingQueue
          open={open.queue}
          handleClose={() => {
            setOpen((prev) => ({ ...prev, queue: false }));
          }}
        />
      )}
    </>
  );
};

export default Games;
