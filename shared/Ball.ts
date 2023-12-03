import {
  BALL_HALF_HEIGHT,
  BALL_HALF_WIDTH,
  BALL_VELOCITY,
  BALL_X_POSITION,
  Ball_Y_POSITION,
  PADDLE_HALF_HEIGHT,
  PADDLE_HALF_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN_X,
  PADDLE_WIDTH,
  SPEED_FACTOR,
} from './constant';
import { Player } from './Player';
import { Coordinate, Velocity } from './types';
import { sign } from './utils';

export class Ball {
  private radius: number;
  private position: Coordinate;
  private velocity: Velocity;
  private width: number;

  constructor(postion: Coordinate, velocity: Velocity, radius: number) {
    this.position = postion;
    this.velocity = velocity;
    this.radius = radius;
    this.width = radius * 2;
  }



  private resetBall() {
    this.position.x = BALL_X_POSITION;
    this.position.y = Ball_Y_POSITION;
    this.velocity.x = Math.random() < 0.5 ? -BALL_VELOCITY : BALL_VELOCITY;
    this.velocity.y = Math.random() < 0.5 ? -BALL_VELOCITY : BALL_VELOCITY;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = 'white';
    context.strokeStyle = 'white';
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  reverseX() {
    this.velocity.x += sign(this.velocity.x) * SPEED_FACTOR;
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

  private checkCollisionWithPlayer1 = (player1: Player) => {
    const collidesX =
      this.position.x <= PADDLE_MARGIN_X + PADDLE_WIDTH + BALL_HALF_WIDTH &&
      this.position.x >= PADDLE_HALF_WIDTH + PADDLE_MARGIN_X;
    const collidesY =
      this.position.y >
        player1.getPostion.y - PADDLE_HALF_HEIGHT - BALL_HALF_HEIGHT &&
      this.position.y <
        player1.getPostion.y + PADDLE_HALF_HEIGHT + BALL_HALF_HEIGHT;
    if (collidesX && collidesY) {
      this.position.x = PADDLE_MARGIN_X + PADDLE_WIDTH + BALL_HALF_WIDTH;
      this.reverseX();
    }
  };

  private checkCollisionWithPlayer2 = (player2: Player) => {
    const collidesX =
      this.position.x >=
        1 - (PADDLE_MARGIN_X + PADDLE_WIDTH + BALL_HALF_WIDTH) &&
      this.position.x <= 1 - (PADDLE_HALF_WIDTH + PADDLE_MARGIN_X);
    const collidesY =
      this.position.y >
        player2.getPostion.y - PADDLE_HALF_HEIGHT - BALL_HALF_HEIGHT &&
      this.position.y <
        player2.getPostion.y + PADDLE_HALF_HEIGHT + BALL_HALF_HEIGHT;
    if (collidesX && collidesY) {
      this.position.x = 1 - (PADDLE_MARGIN_X + PADDLE_WIDTH + BALL_HALF_WIDTH);
      this.reverseX();
    }
  };

  public updatePosition(dt: number, player1: Player, player2: Player) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    if (this.position.y + BALL_HALF_HEIGHT >= 1) {
      this.position.y = 1 - BALL_HALF_HEIGHT;
      this.reverseY();
    }

    if (this.position.y - BALL_HALF_HEIGHT < 0) {
      this.position.y = BALL_HALF_HEIGHT;
      this.reverseY();
    }

    if (this.position.x + BALL_HALF_WIDTH >= 1) {
      this.resetBall();
    }
    if (this.position.x - BALL_HALF_WIDTH <= 0) {
      this.resetBall();
    }
    this.checkCollisionWithPlayer1(player1);
    this.checkCollisionWithPlayer2(player2);
  }
}
