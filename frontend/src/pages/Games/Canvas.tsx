import { useEffect, useRef } from "react";
import { Ball } from "./Ball";
import { ArrowDown, ArrowUp, Map, Paddle } from "./Paddle";
import React from "react";

const keyPressed: boolean[] = [];

interface CanvasProps
  extends React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {}

const Canvas = ({ ...props }: CanvasProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ball = new Ball(
      20,
      { x: 100, y: 100 },
      { height: 100, width: 100 },
      { x: 10, y: 10 }
    );

    const paddle1 = new Paddle(
      { x: 0, y: 50 },
      { x: 10, y: 10 },
      { width: 20, height: 160 }
    );

    const paddle2 = new Paddle(
      { x: canvas.width - 20, y: 30 },
      { x: 10, y: 10 },
      { width: 20, height: 160 }
    );
    const context = canvas.getContext("2d");

    if (!context) return;

    window.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key === ArrowDown || ev.key === ArrowUp)
        keyPressed[Map[ev.key]] = true;
    });

    window.addEventListener("keyup", (ev: KeyboardEvent) => {
      if (ev.key === ArrowDown || ev.key === ArrowUp)
        keyPressed[Map[ev.key]] = false;
    });

    const player2Ai = (ball: Ball, paddle: Paddle) => {
      if (ball.velocity.x > 0) {
        if (ball.position.y > paddle.position.y) {
          paddle.position.y += paddle.velocity.y;

          if (paddle.position.y + paddle.dimension.height >= canvas.height) {
            paddle.position.y = canvas.height - paddle.dimension.height;
          }
        }

        if (ball.position.y < paddle.position.y) {
          paddle.position.y -= paddle.velocity.y;

          if (paddle.position.y <= 0) {
            paddle.position.y = 0;
          }
        }
      }
    };

    const ballPaddleCollision = (ball: Ball, paddle: Paddle) => {
      const dx = Math.abs(ball.position.x - paddle.getCenter().x);
      const dy = Math.abs(ball.position.y - paddle.getCenter().y);

      if (
        dx <= ball.radius + paddle.getHalfWidth() &&
        dy <= paddle.getHalfHeight() + ball.radius
      ) {
        ball.velocity.x *= -1;
      }
    };

    const gameUpdate = () => {
      ball.update(canvas);
      paddle1.update(canvas, keyPressed);
      player2Ai(ball, paddle2);
      ballPaddleCollision(ball, paddle1);
    };

    const gameDraw = () => {
      ball.draw(context);
      paddle1.draw(context);
      paddle2.draw(context);
    };

    const gameLoop = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(0, 0, 0, 0.2)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const id = window.requestAnimationFrame(gameLoop);
      gameUpdate();
      gameDraw();
      return () => {
        window.cancelAnimationFrame(id);
      };
    };

    gameLoop();
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <canvas
      style={{ overflow: "hidden" }}
      width={props.width}
      {...props}
      ref={canvasRef}
    />
  );
};

export default Canvas;
