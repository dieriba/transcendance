import { Coordinate, Dimension, Velocity } from "./types";
import {
  ArrowDown,
  ArrowUp,
  PADDLE_MAX_Y_POS,
  PADDLE_MIN_Y_POS,
  keyPressedType,
} from "./constant";
import { clamp } from "./utils";

export enum KeyboardOptions {
  ARROW_UP = ArrowUp,
  ARROW_DOWN = ArrowDown,
}

export const Map = {
  ArrowUp: 0,
  ArrowDown: 1,
};

export class Player {
  private id: string;
  private position: Coordinate;
  private dimension: Dimension;
  private velocity: Velocity;
  private score: number;
  private moveUp: boolean;
  private moveDown: boolean;

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
    this.score = 0;
  }

  public updatePosition() {
    if (this.moveUp) this.position.y -= this.velocity.y;
    if (this.moveDown) this.position.y += this.velocity.y;
    this.position.y = clamp(
      this.position.y,
      PADDLE_MIN_Y_POS,
      PADDLE_MAX_Y_POS
    );
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

  public clearMovePosition(direction: keyPressedType) {
    if (direction === KeyboardOptions.ARROW_UP) {
      this.moveUp = false;
      return;
    }
    this.moveDown = false;
  }

  public setMove(direction?: keyPressedType) {
    if (direction === KeyboardOptions.ARROW_UP) {
      this.moveUp = true;
      return;
    }
    this.moveDown = true;
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
}
