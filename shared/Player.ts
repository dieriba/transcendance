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
  private id: string;
  private moveLeft: boolean;
  private moveRight: boolean;
  private position: Coordinate;
  private dimension: Dimension;
  private velocity: Velocity;
  private score: number;

  constructor(
    dimension: Dimension,
    postion: Coordinate,
    velocity: Velocity,
    id?: string
  ) {
    this.id = id as string;
    this.position = postion;
    this.dimension = dimension;
    this.velocity = velocity;
    this.moveLeft = false;
    this.moveRight = false;
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

  get getPlayerId(): string {
    return this.id;
  }

  set setYPosition(y: number) {
    this.position.y = y;
  }

  set setXPosition(x: number) {
    this.position.x = x;
  }

  set setId(id: string) {
    this.id = id;
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

  get isMovingLeft(): boolean {
    return this.moveLeft;
  }

  get isMovingRight(): boolean {
    return this.moveRight;
  }
}
