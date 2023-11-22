import { Coordinate, Dimension, Velocity } from "./types";

export class Ball {
  radius: number;
  position: Coordinate;
  dimension: Dimension;
  velocity: Velocity;

  private width: number;

  constructor(
    postion: Coordinate,
    dimension: Dimension,
    velocity: Velocity,
    radius: number
  ) {
    this.position = postion;
    this.dimension = dimension;
    this.velocity = velocity;
    this.radius = radius;
    this.width = radius - 2;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "white";
    context.strokeStyle = "white";
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  reverseX() {
    this.velocity.x *= -1;
  }

  reverseY() {
    this.velocity.y *= -1;
  }

  get getWidth(): number {
    return this.width;
  }

  public move(canvas: HTMLCanvasElement) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x > canvas.width - this.width) {
      this.reverseX();
    }

    if (
      this.position.y - this.radius <= 0 ||
      this.position.y > canvas.height - this.width
    ) {
      this.reverseY();
    }
  }
}
