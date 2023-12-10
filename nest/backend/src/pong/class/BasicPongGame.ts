import { Player, Ball } from 'shared';
import {
  defaultPlayer,
  defaultOpponentPlayer,
  defaultBall,
  FRAME_RATE,
  PongTypeNormal,
} from '../../../shared/constant';
import { EndGameData } from 'shared/types';
import { IPongGame } from './IGame';

export class BasicPongGame extends IPongGame {
  private ball: Ball;
  constructor(gameId: string, playerId: string, socketId: string) {
    super(PongTypeNormal);
    this.setGameId = gameId;
    this.setPlayer = new Player(
      {
        width: defaultPlayer.paddleWidth,
        height: defaultPlayer.paddleHeight,
      },
      { x: defaultPlayer.xPosition, y: defaultPlayer.yPosition },
      {
        x: defaultPlayer.speed,
        y: defaultPlayer.speed,
      },
      playerId,
    );
    this.setOpponentPlayer = new Player(
      {
        width: defaultOpponentPlayer.paddleWidth,
        height: defaultOpponentPlayer.paddleHeight,
      },
      {
        x: defaultOpponentPlayer.xPosition,
        y: defaultOpponentPlayer.yPosition,
      },
      {
        x: defaultOpponentPlayer.speed,
        y: defaultOpponentPlayer.speed,
      },
    );
    this.setBall = new Ball(
      {
        x: defaultBall.xPosition,
        y: defaultBall.yPosition,
      },
      { x: defaultBall.speed, y: defaultBall.speed },
      defaultBall.radius,
    );
    this.pushNewPlayer(playerId);
    this.pushNewSocketId(socketId);
  }

  get getBall() {
    return this.ball;
  }

  set setBall(ball: Ball) {
    this.ball = ball;
  }

  public update() {
    const now = performance.now();
    const dt = this.getLastTime === -1 ? FRAME_RATE : now - this.getLastTime;
    const score = this.getBall.updatePosition(
      dt,
      this.getPlayer,
      this.getOppenent,
    );

    if (this.getPlayer.getScore !== score.player1Score) this.getPlayer.scored();
    if (this.getOppenent.getScore !== score.player2Score)
      this.getOppenent.scored();

    this.getPlayer.updatePosition(dt);
    this.getOppenent.updatePosition(dt);
    this.isAWinnerOrTimeGameLimitReached();
    this.setLastTime = now;
  }

  public getUpdatedData(): unknown {
    return {
      player1: {
        ...this.getPlayer.getPostion,
        score: this.getPlayer.getScore,
        id: this.getPlayer.getPlayerId,
      },
      player2: {
        ...this.getOppenent.getPostion,
        score: this.getOppenent.getScore,
        id: this.getOppenent.getPlayerId,
      },
      coordinates: [this.getBall.getPosition],
    };
  }

  public getEndGameData(): EndGameData {
    return {
      winner: {
        id: this.getWinner.getPlayerId,
        score: this.getWinner.getScore,
      },
      looser: {
        id: this.getLooser.getPlayerId,
        score: this.getLooser.getScore,
      },
    };
  }
}
