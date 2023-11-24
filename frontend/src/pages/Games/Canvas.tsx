import { useEffect, useRef, useState } from "react";
import React from "react";
import { Box } from "@mui/material";
import {
  GAME_BOARD_HEIGHT,
  GAME_BOARD_WIDTH,
  RESIZE_FACTOR,
} from "../../../../shared/constant";
import { Ball } from "./Ball";
import { Player } from "./Player";

interface CanvasProps
  extends React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {}

const Canvas = () => {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: Number(window.innerWidth / RESIZE_FACTOR),
    height: Number(window.innerHeight / RESIZE_FACTOR),
  });

  const getResponsiveSize = () => {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = GAME_BOARD_WIDTH / GAME_BOARD_HEIGHT;

    let newWidth, newHeight;

    if (windowRatio > gameRatio) {
      newHeight = window.innerHeight / RESIZE_FACTOR;
      newWidth = newHeight * gameRatio;
    } else {
      newWidth = window.innerWidth / RESIZE_FACTOR;
      newHeight = newWidth / gameRatio;
    }
    return { width: newWidth, height: newHeight };
  };

  useEffect(() => {
    const updateDimensions = () => {
      const newSize = getResponsiveSize();
      setCanvasDimensions(newSize);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.fillStyle = "black";
    context.canvas.style.imageRendering = "auto";
    let animationId: number;

    const ball = new Ball(
      { x: canvas.width / 2, y: canvas.height / 2 },
      { x: 3, y: 2 },
      2
    );

    const Player1 = new Player(
      canvas,
      context,
      { x: canvas.width / 2, y: canvas.height - 20 },
      { x: 4, y: 4 },
      { width: 50, height: 5 }
    );

    const Player2 = new Player(
      canvas,
      context,
      { x: canvas.width / 2, y: 0 },
      { x: 4, y: 4 },
      { width: 50, height: 5 }
    );

    const gameLoop = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      ball.draw(context);
      ball.move(canvas);
      ball.checkCollisionWithPlayer(Player1);
      Player1.draw();
      Player1.movePaddle();
      Player2.draw();
      animationId = window.requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [canvasRef, canvasDimensions.width, canvasDimensions.height]);

  return (
    <Box
      height={"100vh"}
      alignItems={"center"}
      display={"flex"}
      justifyContent={"center"}
      width={"100%"}
    >
      <canvas
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        ref={canvasRef}
      />
    </Box>
  );
};

export default Canvas;
