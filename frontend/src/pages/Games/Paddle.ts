import { Coordinate, Dimension, Velocity } from "./types";

export const ArrowUp = "ArrowUp";
export const ArrowDown = "ArrowDown";

export const Map = {
  ArrowUp: 0,
  ArrowDown: 1,
};

export class Paddle {
  position: Coordinate;
  dimension: Dimension;
  velocity: Velocity;

  constructor(postion: Coordinate, velocity: Velocity, dimension: Dimension) {
    this.position = postion;
    this.dimension = dimension;
    this.velocity = velocity;
  }

  public update(canvas: HTMLCanvasElement, keyPressed: boolean[]) {
    if (keyPressed[Map[ArrowUp]]) {
      this.position.y -= this.velocity.y;
    }
    if (keyPressed[Map[ArrowDown]]) {
      this.position.y += this.velocity.y;
    }
    if (this.position.y <= 0) {
      this.position.y = 0;
    }

    if (this.position.y + this.dimension.height >= canvas.height) {
      this.position.y = canvas.height - this.dimension.height;
    }
  }

  public getHalfWidth(): number {
    return this.dimension.width / 2;
  }

  public getHalfHeight(): number {
    return this.dimension.height / 2;
  }

  public getCenter(): Coordinate {
    return {
      x: this.position.x + this.getHalfWidth(),
      y: this.position.y + this.getHalfHeight(),
    };
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "33ff00";
    context.fillRect(
      this.position.x,
      this.position.y,
      this.dimension.width,
      this.dimension.height
    );
  }
}
