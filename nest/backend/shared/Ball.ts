import { BALL_HIGH, BALL_LOW, GAME_BOARD_WIDTH } from "./constant";
import { Player } from "./Player";
import { Coordinate, Velocity } from "./types";

export class Ball {
  private radius: number;
  private position: Coordinate;
  private velocity: Velocity;
  private width: number;
  private lastFrameTime: number;

  constructor(postion: Coordinate, velocity: Velocity, radius: number) {
    this.position = postion;
    this.velocity = velocity;
    this.radius = radius;
    this.width = radius * 2;
    this.lastFrameTime = performance.now();
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

  get getPosition(): Coordinate {
    return this.position;
  }

  get getVelocity(): Velocity {
    return this.velocity;
  }

  set setLastFrameTime(lastFrameTime: number) {
    this.lastFrameTime = lastFrameTime;
  }

  public checkCollisionWithPlayer = (player: Player) => {
    if (
      this.position.x + this.width > player.getPostion.x &&
      this.position.x < player.getPostion.x + player.getDimension.width &&
      this.position.y + this.width === player.getPostion.y
    ) {
      this.reverseY();
    }
  };

  public updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.radius >= 1) this.reverseY();
  }
}