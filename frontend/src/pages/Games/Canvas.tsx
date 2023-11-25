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
  > {
  width: number;
  height: number;
}

const Canvas = ({ width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

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
    };
  }, [canvasRef, height, width]);

  return (
    <canvas
      style={{ width, height }}
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
};

export default Canvas;
