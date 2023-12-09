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

export class SpecialPongGame extends IPongGame {
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

  public update() {
    const now = performance.now();
    const dt = this.getLastTime === -1 ? FRAME_RATE : now - this.getLastTime;
    this.getBall.updatePosition(dt, this.getPlayer, this.getOppenent);
    this.getPlayer.updatePosition(dt);
    this.getOppenent.updatePosition(dt);
    this.isAWinnerOrTimeGameLimitReached();
    this.setLastTime = now;
  }

  public getUpdatedData(): unknown {
    return {
      player1: {
        ...this.getPlayer.getPostion,
        score: this.getBall.getPlayersScore[0],
        id: this.getPlayer.getPlayerId,
      },
      player2: {
        ...this.getOppenent.getPostion,
        score: this.getBall.getPlayersScore[1],
        id: this.getOppenent.getPlayerId,
      },
      ball: this.getBall.getPosition,
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
