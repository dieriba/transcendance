import { Coordinate, Dimension, Velocity } from "./types";

export class Ball {
  radius: number;
  position: Coordinate;
  dimension: Dimension;
  velocity: Velocity;

  constructor(
    radius: number,
    postion: Coordinate,
    dimension: Dimension,
    velocity: Velocity
  ) {
    this.radius = radius;
    this.position = postion;
    this.dimension = dimension;
    this.velocity = velocity;
  }

  public incrementX() {
    this.position.x++;
  }

  public incrementY() {
    this.position.y++;
  }

  public updateVelocityX(factor: number) {
    this.velocity.x += factor;
  }

  public updateVelocityY(factor: number) {
    this.velocity.y += factor;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "#33ff00";
    context.strokeStyle = "#33ff00";
    context.fill();
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.stroke();
  }

  public update(canvas: HTMLCanvasElement) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.position.y + this.radius >= canvas.height) {
      this.velocity.y *= -1;
    }
    if (this.position.y - this.radius <= 0) {
      this.velocity.y *= -1;
    }
    if (this.position.x + this.radius >= canvas.width) {
      this.velocity.x *= -1;
    }
    if (this.position.x + this.radius <= 0) {
      this.velocity.x *= -1;
    }
  }
}
