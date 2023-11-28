import { Coordinate, Dimension } from "./types";

export enum KeyboardOptions {
  ARROW_UP = "ArrowUp",
  ARROW_DOWN = "ArrowDown",
}

export const Map = {
  ArrowUp: 0,
  ArrowDown: 1,
};

export class Player {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private position: Coordinate;
  private dimension: Dimension;
  private score: number;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    dimension: Dimension
  ) {
    this.position = { x: 0, y: 0 };
    this.dimension = dimension;
    this.canvas = canvas;
    this.context = context;
    this.score = 0;
  }

  public move(canvas: HTMLCanvasElement) {
    if (this.position.y <= 0) {
      this.position.y = 0;
    }

    if (this.position.y + this.dimension.height >= canvas.height) {
      this.position.y = canvas.height - this.dimension.height;
    }
  }

  get getPostion(): Coordinate {
    return this.position;
  }

  get getDimension(): Dimension {
    return this.dimension;
  }

  set setYPosition(y: number) {
    this.position.y = y;
  }

  set setXPosition(x: number) {
    this.position.x = x;
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

  public scored() {
    this.score++;
  }

  public draw(position: Coordinate) {
    this.context.fillStyle = "white";
    this.position = position;
    this.context.fillRect(
      (this.position.x - this.dimension.width / 2) * this.canvas.width,
      (this.position.y - this.dimension.height / 2) * this.canvas.height,
      this.dimension.width * this.canvas.width,
      this.dimension.height * this.canvas.height
    );
  }
}
