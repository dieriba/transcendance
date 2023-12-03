import { Player, Ball } from 'shared';
import {
  GAME_INVITATION_TIME_LIMIT,
  defaultPlayer,
  defaultOpponentPlayer,
  defaultBall,
  scoreToWinPongGame,
  keyPressedType,
  pongGameDuration,
} from 'shared/constant';
import { EndGameData, UpdatedGameData } from 'shared/types';

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
    socketId: string,
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
      Math.abs(this.date.getTime() - now.getTime()) / 1000,
    );

    if (seconds >= GAME_INVITATION_TIME_LIMIT) return 0;

    return GAME_INVITATION_TIME_LIMIT - seconds;
  }
}

export class Game {
  private activate: boolean;
  private gameId: string;
  private players: string[] = [];
  private socketsId: string[] = [];
  private player: Player;
  private opponentPlayer: Player;
  private startedTime: Date;
  private endTime: Date;
  private ball: Ball;
  private gameStarted: boolean;
  private gameDurationExceed: boolean = false;
  private winner: Player | undefined = undefined;
  private looser: Player | undefined = undefined;
  private draw: boolean = false;

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
      playerId,
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
      },
    );
    this.ball = new Ball(
      {
        x: defaultBall.xPosition,
        y: defaultBall.yPosition,
      },
      { x: defaultBall.speed, y: defaultBall.speed },
      defaultBall.radius,
    );
    this.players.push(playerId);
    this.socketsId.push(socketId);
  }

  public update() {
    this.ball.updatePosition();
    this.player.updatePosition();
    this.opponentPlayer.updatePosition();
    this.isAWinnerOrTimeGameLimitReached();
    // this.ball.checkCollisionWithPlayer(this.player);
    //this.ball.checkCollisionWithPlayer(this.opponentPlayer);
  }

  private isAWinnerOrTimeGameLimitReached() {
    if (this.player.getScore >= scoreToWinPongGame) {
      this.winner = this.player;
      this.looser = this.opponentPlayer;
      return;
    }
    if (this.opponentPlayer.getScore >= scoreToWinPongGame) {
      this.winner = this.opponentPlayer;
      this.looser = this.player;
      return;
    }
    const now = new Date();

    if (now >= this.endTime) {
      this.gameDurationExceed = true;

      if (this.player.getScore >= scoreToWinPongGame) {
        this.winner = this.player;
        this.looser = this.opponentPlayer;
        return;
      }

      if (this.opponentPlayer.getScore >= scoreToWinPongGame) {
        this.winner = this.opponentPlayer;
        this.looser = this.player;
        return;
      }

      this.draw = true;
    }
  }

  public endGame(): boolean {
    if (this.winner || this.gameDurationExceed) return true;

    return false;
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

  public getEndGameData(): EndGameData {
    return {
      winner: {
        id: this.winner.getPlayerId,
        score: this.winner.getScore,
        nickname: '',
      },
      looser: {
        id: this.looser.getPlayerId,
        score: this.looser.getScore,
      },
    };
  }

  get hasStarted(): boolean {
    return this.gameStarted;
  }

  get getActivate(): boolean {
    return this.activate;
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

  get getWinner(): Player {
    return this.winner;
  }

  get getLooser(): Player {
    return this.looser;
  }

  get getDraw(): boolean {
    return this.draw;
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

  public startGame() {
    this.startedTime = new Date();
    this.gameStarted = true;
    this.endTime = new Date(
      this.startedTime.getTime() + pongGameDuration * 60000,
    );
  }

  set setActivate(activate: boolean) {
    this.activate = activate;
  }

  public setNewsocketIdAt(socketId: string, index: 0 | 1) {
    if (this.socketsId.length === 1 && index === 1) {
      this.socketsId.push(socketId);
      return;
    }
    this.socketsId[0] = socketId;
  }

  public updatePlayerPosition(userId: string, direction: keyPressedType) {
    if (this.player.getPlayerId === userId) {
      this.player.setMove(direction);
      return;
    }
    this.opponentPlayer.setMove(direction);
  }

  public stopUpdatePlayerPosition(userId: string, direction: keyPressedType) {
    if (this.player.getPlayerId === userId) {
      this.player.clearMovePosition(direction);
      return;
    }
    this.opponentPlayer.clearMovePosition(direction);
  }

  removeUser(userId: string) {
    this.players = this.players.filter((playerId) => playerId !== userId);
  }
}
