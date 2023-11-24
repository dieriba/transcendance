import { Ball } from "./Ball";
import { defaultBall, defaultOpponentPlayer, defaultPlayer } from "./constant";
import { Player } from "./Player";

export class Game {
  private gameStarted: boolean;
  private gameId: string;
  private players: string[] = [];
  private player: Player;
  private opponentPlayer: Player;
  private ball: Ball;

  constructor(playerId: string, gameId: string) {
    this.gameId = gameId;
    this.player = new Player(
      {
        width: defaultPlayer.paddleWidth,
        height: defaultPlayer.paddleHeight,
      },
      { x: defaultPlayer.xPosition, y: defaultPlayer.yPosition },
      {
        x: defaultPlayer.speed,
        y: defaultPlayer.speed,
      }
    );
    this.opponentPlayer = new Player(
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
      }
    );
    this.ball = new Ball(
      {
        x: defaultBall.xPosition,
        y: defaultBall.yPosition,
      },
      { x: defaultBall.speed, y: defaultBall.speed },
      defaultBall.radius
    );
    this.players.push(playerId);
  }

  public update() {
    this.ball.move();
    this.ball.checkCollisionWithPlayer(this.player);
    this.ball.checkCollisionWithPlayer(this.opponentPlayer);
  }

  get hasStarted(): boolean {
    return this.gameStarted;
  }

  get numberOfUser(): number {
    return this.players.length;
  }

  get getPlayer(): Player {
    return this.player;
  }

  get getOppenent(): Player {
    return this.opponentPlayer;
  }

  get getBall(): Ball {
    return this.ball;
  }

  get getGameId(): string {
    return this.gameId;
  }

  get getPlayers(): string[] {
    return this.players;
  }

  set oponnentPlayer(userId: string) {
    this.players.push(userId);
  }

  removeUser(userId: string) {
    this.players = this.players.filter((playerId) => playerId !== userId);
  }
}
