import { useEffect, useRef } from "react";
import { Ball } from "./Ball";
import { Player } from "./Player";
import { connectSocket, socket } from "../../utils/getSocket";
import { PongEvent } from "../../../shared/socket.event";
import usePageSize from "../../services/custom-hooks/usePageSize";
import { GAME_MARGIN, ASPECT_RATIO } from "../../../shared/constant";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
import { Avatar, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { showSnackBar } from "../../redux/features/app/app.slice";
import { SocketServerSucessResponse } from "../../services/type";
import { StartGameInfo, UpdatedGameData } from "../../../shared/types";
import { RootState } from "../../redux/store";

const Pong = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useAppDispatch();
  const { width, height } = usePageSize();
  const gameData = useAppSelector(
    (state: RootState) => state.pong.gameData
  ) as StartGameInfo;
  const navigate = useNavigate();
  const gameWidth = Math.min(
    width - 2 * GAME_MARGIN,
    (height - 2 * GAME_MARGIN) * ASPECT_RATIO
  );
  const gameHeight = gameWidth / ASPECT_RATIO;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    connectSocket();

    canvas.width = gameWidth;
    canvas.height = gameHeight;
    canvas.style.width = `${gameWidth}px`;
    canvas.style.height = `${gameHeight}px`;

    context.fillStyle = "black";

    const ball = new Ball();

    const Player1 = new Player(canvas, context, { height: 0.16, width: 0.015 });

    const Player2 = new Player(canvas, context, { height: 0.16, width: 0.015 });

    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const { key, code } = event;
      if (code === PongEvent.ARROW_UP || key === PongEvent.ARROW_UP) {
        socket.emit(PongEvent.UPDATE_PLAYER_POSITION, {
          gameId: gameData?.room,
          keyPressed: code,
        });
      } else if (
        code === PongEvent.ARROW_DOWN ||
        key === PongEvent.ARROW_DOWN
      ) {
        socket.emit(PongEvent.UPDATE_PLAYER_POSITION, {
          gameId: gameData?.room,
          keyPressed: code,
        });
      }
    });

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      const { key, code } = event;
      if (code === PongEvent.ARROW_UP || key === PongEvent.ARROW_UP) {
        socket.emit(PongEvent.USER_STOP_UPDATE, {
          gameId: gameData?.room,
          keyPressed: code,
        });
      } else if (
        code === PongEvent.ARROW_DOWN ||
        key === PongEvent.ARROW_DOWN
      ) {
        socket.emit(PongEvent.USER_STOP_UPDATE, {
          gameId: gameData?.room,
          keyPressed: code,
        });
      }
    });

    socket.on(PongEvent.UPDATE_GAME, (data: { data: UpdatedGameData }) => {
      const { player1, player2 } = data.data;
      //context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "red";
      context.fillRect(0, 0, canvas.width, canvas.height);
      ball.draw(canvas, context, data.data.ball);
      Player1.draw(player1);
      Player2.draw(player2);
    });

    socket.on(
      PongEvent.USER_NO_MORE_IN_GAME,
      (data: SocketServerSucessResponse & { data: unknown }) => {
        navigate(PATH_APP.dashboard.games, { replace: true });
        dispatch(
          showSnackBar({ message: data.message, severity: data.severity })
        );
      }
    );

    socket.on(
      PongEvent.END_GAME,
      (data: SocketServerSucessResponse & { data: { message: string } }) => {
        navigate(PATH_APP.dashboard.games, { replace: true });
        dispatch(
          showSnackBar({ message: data.data.message, severity: data.severity })
        );
      }
    );

    return () => {
      socket.off(PongEvent.END_GAME);
      socket.off(PongEvent.UPDATE_GAME);
      socket.off(PongEvent.USER_NO_MORE_IN_GAME);
    };
  }, [
    navigate,
    canvasRef,
    height,
    width,
    gameHeight,
    gameWidth,
    dispatch,
    gameData,
  ]);

  return (
    <Stack
      width={"100%"}
      alignItems={"center"}
      height={"100%"}
      display={"flex"}
      justifyContent={"center"}
      spacing={2}
    >
      <Stack width={"85%"} justifyContent={"space-between"} direction={"row"}>
        <Stack>
          <Avatar src={gameData?.creator.avatar} />
          <Typography>{gameData?.creator.nickname}</Typography>
        </Stack>
        <Stack width="maxContent" alignItems={"center"}>
          <Avatar src={gameData?.opponent.avatar} />
          <Typography>{gameData?.opponent.nickname}</Typography>
        </Stack>
      </Stack>
      <canvas
        style={{ width: gameWidth, height: gameHeight }}
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
      />
    </Stack>
  );
};

export default Pong;
