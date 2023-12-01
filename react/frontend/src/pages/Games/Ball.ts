import { Coordinate } from "./types";
import { BALL_HALF_WIDTH } from "../../../shared/constant";

export class Ball {
  public draw(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    position: Coordinate
  ) {
    context.fillStyle = "white";
    context.strokeStyle = "white";
    context.beginPath();
    context.arc(
      position.x * canvas.width,
      position.y * canvas.height,
      BALL_HALF_WIDTH * canvas.width,
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();
  }
}
