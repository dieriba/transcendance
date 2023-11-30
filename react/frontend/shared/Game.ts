import { Ball } from "./Ball";
import {
  defaultBall,
  defaultOpponentPlayer,
  defaultPlayer,
  GAME_INVITATION_TIME_LIMIT,
} from "./constant";
import { Player } from "./Player";
import { UpdatedGameData } from "./types";

export class GameInvitation {
  private readonly id: string;
  private readonly invitedUserId: string;
  private readonly date: Date = new Date();
  private readonly gameId: string;
  private readonly socketId: string;

  constructor(
    gameId: string,
    id: string,
    invitedUserId: string,
    socketId: string
  ) {
    this.id = id;
    this.invitedUserId = invitedUserId;
    this.gameId = gameId;
    this.socketId = socketId;
  }

  get getInvitedUser() {
    return this.invitedUserId;
  }

  get getSenderId() {
    return this.id;
  }

  get getGameId() {
    return this.gameId;
  }

  get getSocketId() {
    return this.socketId;
  }

  hasNotExpired(): number {
    const now = new Date();

    const seconds = Math.round(
      Math.abs(this.date.getTime() - now.getTime()) / 1000
    );

    if (seconds >= GAME_INVITATION_TIME_LIMIT) return 0;

    return GAME_INVITATION_TIME_LIMIT - seconds;
  }
}

export class Game {
  private gameStarted: boolean;
  private gameId: string;
  private players: string[] = [];
  private socketsId: string[] = [];
  private player: Player;
  private opponentPlayer: Player;
  private startedTime: Date;
  private endTime: Date;
  private ball: Ball;

  constructor(gameId: string, playerId: string, socketId: string) {
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
      },
      playerId
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
    this.socketsId.push(socketId);
  }

  public update() {
    this.ball.updatePosition();
    this.ball.checkCollisionWithPlayer(this.player);
    this.ball.checkCollisionWithPlayer(this.opponentPlayer);
  }

  public getUpdatedData(): UpdatedGameData {
    return {
      player1: { ...this.getPlayer.getPostion, id: this.getPlayer.getPlayerId },
      player2: {
        ...this.getOppenent.getPostion,
        id: this.getOppenent.getPlayerId,
      },
      ball: this.ball.getPosition,
    };
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

  get getSocketIds(): string[] {
    return this.socketsId;
  }

  get getStartedTime(): Date {
    return this.startedTime;
  }

  set setOponnentPlayer(userId: string) {
    this.players.push(userId);
    this.opponentPlayer.setId = userId;
  }

  set setNewSocketId(socketId: string) {
    this.socketsId.push(socketId);
  }

  set setGameStarted(started: boolean) {
    this.gameStarted = started;
    this.startedTime = new Date();
  }

  public setNewsocketIdAt(socketId: string, index: 0 | 1) {
    if (this.socketsId.length === 1 && index === 1) {
      this.socketsId.push(socketId);
      return;
    }
    this.socketsId[0] = socketId;
  }

  removeUser(userId: string) {
    this.players = this.players.filter((playerId) => playerId !== userId);
  }
}