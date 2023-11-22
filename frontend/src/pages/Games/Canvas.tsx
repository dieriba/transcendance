import { useEffect, useRef } from "react";
import React from "react";
import { Ball } from "./Ball";
import { Player } from "./Player";

interface CanvasProps
  extends React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {}

const Canvas = ({ ...props }: CanvasProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.fillStyle = "black";

    let animationId: number;

    const ball = new Ball(
      { x: canvas.width / 2, y: canvas.height / 2 },
      { height: 10, width: 10 },
      { x: 5, y: 5 },
      10
    );

    const Player1 = new Player(
      canvas,
      context,
      { x: 0, y: canvas.height / 2 },
      { x: 10, y: 10 },
      { width: 20, height: 150 }
    );

    const Player2 = new Player(
      canvas,
      context,
      { x: canvas.width - 20, y: 30 },
      { x: 10, y: 10 },
      { width: 20, height: 160 }
    );

    const checkCollisionWithPlayer = (player: Player): boolean => {
      if (
        ball.position.x - ball.getWidth <= player.getPostion.x &&
        ball.position.x >= player.getPostion.x - player.getDimension.width
      ) {
        if (
          ball.position.y <= player.getPostion.y + player.getDimension.height &&
          ball.position.y + ball.dimension.height >= player.getPostion.y
        ) {
          return true;
        }
      }
      return false;
    };

    const gameLoop = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      ball.draw(context);
      ball.move(canvas);
      if (checkCollisionWithPlayer(Player1)) {
        ball.reverseY();
      }
      Player1.draw();
      animationId = window.requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return <canvas style={{ overflow: "hidden" }} {...props} ref={canvasRef} />;
};

export default Canvas;
