import { Player, Ball } from 'shared';
import {
  defaultPlayer,
  defaultOpponentPlayer,
  defaultBall,
  FRAME_RATE,
  PongTypeSpecial,
} from '../../../shared/constant';
import { EndGameData } from 'shared/types';
import { IPongGame } from './IGame';
import { getRandomNumber } from 'shared/utils';

export class SpecialPongGame extends IPongGame {
  private balls: Ball[] = [];

  constructor(gameId: string, playerId: string, socketId: string) {
    super(PongTypeSpecial);
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
    const ballNumber = getRandomNumber(2, 5);

    for (let index = 0; index < ballNumber; index++) {
      this.balls.push(
        new Ball(
          {
            x: defaultBall.xPosition,
            y: defaultBall.yPosition,
          },
          {
            x: index % 2 ? defaultBall.speed : defaultBall.speed * 2,
            y: index % 2 ? defaultBall.speed : defaultBall.speed * 2,
          },
          defaultBall.radius,
        ),
      );
    }

    this.pushNewPlayer(playerId);
    this.pushNewSocketId(socketId);
  }

  public update() {
    const now = performance.now();
    const dt = this.getLastTime === -1 ? FRAME_RATE : now - this.getLastTime;
    this.balls.forEach((ball) => {
      const score = ball.updatePosition(dt, this.getPlayer, this.getOppenent);
      if (score.player1Score !== this.getPlayer.getScore)
        this.getPlayer.scored();
      if (score.player2Score !== this.getOppenent.getScore)
        this.getPlayer.scored();
    });
    this.getPlayer.updatePosition(dt);
    this.getOppenent.updatePosition(dt);
    this.isAWinnerOrTimeGameLimitReached();
    this.setLastTime = now;
  }

  public getUpdatedData(): unknown {
    const ballPosition = this.balls.map((ball) => ball.getPosition);

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
      coordinates: ballPosition,
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
