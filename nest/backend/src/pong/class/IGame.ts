import { Player } from 'shared';
import {
  PongGameType,
  keyPressedType,
  pongGameDuration,
  scoreToWinPongGame,
} from '../../../shared/constant';

export abstract class IPongGame {
  private pongType: PongGameType;
  private player: Player;
  private opponentPlayer: Player;
  private winner: Player | undefined = undefined;
  private looser: Player | undefined = undefined;
  private activate: boolean;
  private gameId: string;
  private players: string[] = [];
  private socketsId: string[] = [];
  private startedTime: Date;
  private endTime: Date;
  private gameStarted: boolean;
  private gameDurationExceed: boolean = false;
  private draw: boolean = false;
  private lastTime: number = -1;

  constructor(type: PongGameType) {
    this.pongType = type;
  }

  public abstract update(): void;

  public abstract getUpdatedData(): unknown;

  public abstract getEndGameData(): unknown;

  public isAWinnerOrTimeGameLimitReached(): void {
    if (this.getPlayer.getScore >= scoreToWinPongGame) {
      this.setWinner = this.getPlayer;
      this.setLooser = this.getOppenent;
      return;
    }
    if (this.getOppenent.getScore >= scoreToWinPongGame) {
      this.setWinner = this.getOppenent;
      this.setLooser = this.getPlayer;
      return;
    }

    const now = new Date();

    if (now >= this.getEndTime) {
      this.setGameDurationExceeded = true;

      if (this.getPlayer.getScore >= scoreToWinPongGame) {
        this.setWinner = this.getPlayer;
        this.setLooser = this.getOppenent;
        return;
      }

      if (this.getOppenent.getScore >= scoreToWinPongGame) {
        this.setWinner = this.getOppenent;
        this.setLooser = this.getPlayer;
        return;
      }

      this.setDraw = true;
    }
  }

  public startGame() {
    this.startedTime = new Date();
    this.gameStarted = true;
    this.endTime = new Date(
      this.startedTime.getTime() + pongGameDuration * 60000,
    );
  }

  public pushNewPlayer(playerId: string) {
    this.players.push(playerId);
  }

  public pushNewSocketId(socketId: string) {
    this.socketsId.push(socketId);
  }

  public removeUser(userId: string) {
    this.players = this.players.filter((playerId) => playerId !== userId);
  }

  public endGame(): boolean {
    if (this.getWinner || this.getGameDurationExceeded) return true;

    return false;
  }

  public updatePlayerPosition(userId: string, direction: keyPressedType) {
    if (this.player.getPlayerId === userId) {
      this.player.setMove(direction);
      return;
    }
    this.opponentPlayer.setMove(direction);
  }

  set setOponnentPlayerId(userId: string) {
    this.pushNewPlayer(userId);
    this.getOppenent.setId = userId;
  }

  public stopUpdatePlayerPosition(userId: string, direction: keyPressedType) {
    if (this.player.getPlayerId === userId) {
      this.player.clearMovePosition(direction);
      return;
    }
    this.opponentPlayer.clearMovePosition(direction);
  }

  get getPongType(): PongGameType {
    return this.pongType;
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

  get getEndTime(): Date {
    return this.endTime;
  }

  get getDraw(): boolean {
    return this.draw;
  }

  get getGameDurationExceeded(): boolean {
    return this.gameDurationExceed;
  }

  get getLastTime(): number {
    return this.lastTime;
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

  set setNewSocketId(socketId: string) {
    this.socketsId.push(socketId);
  }

  set setPlayer(player: Player) {
    this.player = player;
  }

  set setOpponentPlayer(player: Player) {
    this.opponentPlayer = player;
  }

  set setActivate(activate: boolean) {
    this.activate = activate;
  }

  set setThisLastTime(lastTime: number) {
    this.lastTime = lastTime;
  }

  set setGameId(gameId: string) {
    this.gameId = gameId;
  }

  set setLastTime(lastTime: number) {
    this.lastTime = lastTime;
  }

  set setGameDurationExceeded(exceeded: boolean) {
    this.gameDurationExceed = exceeded;
  }

  set setDraw(draw: boolean) {
    this.draw = draw;
  }

  set setWinner(winner: Player) {
    this.winner = winner;
  }

  set setLooser(looser: Player) {
    this.looser = looser;
  }
}
