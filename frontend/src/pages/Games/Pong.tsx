import { useEffect, useRef } from "react";
import { Ball } from "./Ball";
import { Player } from "./Player";
import { connectSocket, socket } from "../../utils/getSocket";
import { PongEvent } from "../../../../shared/socket.event";
import usePageSize from "../../services/custom-hooks/usePageSize";
import { GAME_MARGIN, ASPECT_RATIO } from "./constant";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
import { Box } from "@mui/material";

const Pong = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { width, height } = usePageSize();
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

    socket.on(PongEvent.UPDATE_GAME, (data) => {});

    socket.on(PongEvent.USER_NO_MORE_IN_GAME, (data) => {
      console.log(data);
      navigate(PATH_APP.dashboard.games, { replace: true });
    });

    canvas.width = gameWidth;
    canvas.height = gameHeight;
    canvas.style.width = `${gameWidth}px`;
    canvas.style.height = `${gameHeight}px`;

    context.fillStyle = "black";
    let animationId: number;

    const ball = new Ball(
      { x: canvas.width / 2, y: canvas.height / 2 },
      { x: 1, y: 2 },
      7
    );

    const Player1 = new Player(
      canvas,
      context,
      { x: 0.015, y: 0.5 },
      { x: 2, y: 2 },
      { height: 0.16, width: 0.015 }
    );

    const Player2 = new Player(
      canvas,
      context,
      { x: 1 - Player1.getPostion.x, y: 0.5 },
      { x: 2, y: 2 },
      { height: 0.16, width: 0.015 }
    );

    const gameLoop = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      ball.draw(context);
      ball.move(canvas);
      Player1.draw();
      Player2.draw();
      animationId = window.requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.cancelAnimationFrame(animationId);
      socket.off(PongEvent.UPDATE_GAME);
      socket.off(PongEvent.USER_NO_MORE_IN_GAME);
    };
  }, [navigate, canvasRef, height, width, gameHeight, gameWidth]);

  return (
    <Box
      width={"100%"}
      alignItems={"center"}
      height={"100%"}
      display={"flex"}
      justifyContent={"center"}
    >
      <canvas
        style={{ width: gameWidth, height: gameHeight }}
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
      />
    </Box>
  );
};

export default Pong;
