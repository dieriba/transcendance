import {
  GAME_INVITATION_TIME_LIMIT,
  PongGameType,
} from '../../../shared/constant';

export class GameInvitation {
  private readonly id: string;
  private readonly invitedUserId: string;
  private readonly date: Date = new Date();
  private readonly gameId: string;
  private readonly socketId: string;
  private readonly pongType: PongGameType;

  constructor(
    gameId: string,
    id: string,
    invitedUserId: string,
    socketId: string,
    pongType: PongGameType,
  ) {
    this.id = id;
    this.invitedUserId = invitedUserId;
    this.gameId = gameId;
    this.socketId = socketId;
    this.pongType = pongType;
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

  get getPongType() {
    return this.pongType;
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
