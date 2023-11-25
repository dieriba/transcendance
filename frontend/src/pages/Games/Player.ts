import { Coordinate, Dimension, Velocity } from "./types";

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
  private moveLeft: boolean;
  private moveRight: boolean;
  private position: Coordinate;
  private dimension: Dimension;
  private velocity: Velocity;
  private score: number;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    postion: Coordinate,
    velocity: Velocity,
    dimension: Dimension
  ) {
    this.position = postion;
    this.dimension = dimension;
    this.velocity = velocity;
    this.moveLeft = false;
    this.moveRight = false;
    this.canvas = canvas;
    this.context = context;
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
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

  public draw() {
    this.context.fillStyle = "white";
    this.context.fillRect(
      (this.position.x - (this.dimension.width / 2)) * this.canvas.width,
      (this.position.y - (this.dimension.height / 2)) * this.canvas.height,
      this.dimension.width * this.canvas.width,
      this.dimension.height * this.canvas.height
    );
  }

  get isMovingLeft(): boolean {
    return this.moveLeft;
  }

  get isMovingRight(): boolean {
    return this.moveRight;
  }

  public movePaddle(): void {
    if (
      (this.isMovingLeft && this.position.x > 0) ||
      (this.isMovingRight &&
        this.position.x < this.canvas.width - this.dimension.width)
    ) {
      if (this.moveLeft) this.position.x -= this.velocity.x;
      if (this.moveRight) this.position.x += this.velocity.x;
    }
  }

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (e.code === "ArrowLeft" || e.key === "ArrowLeft") this.moveLeft = false;
    if (e.code === "ArrowRight" || e.key === "ArrowRight")
      this.moveRight = false;
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.code === "ArrowLeft" || e.key === "ArrowLeft") this.moveLeft = true;
    if (e.code === "ArrowRight" || e.key === "ArrowRight")
      this.moveRight = true;
  };
}
