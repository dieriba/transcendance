import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Game, GameInvitation } from '../../shared/Game';
import { SocketWithAuth } from 'src/auth/type';
import { PONG_ROOM_PREFIX, PongEvent } from '../../shared/socket.event';
import { GAME_INVITATION_TIME_LIMIT } from '../../shared/constant';

@Injectable()
export class PongService {
  private readonly games: Game[] = [];
  private readonly gameInvitation: Map<string, GameInvitation> = new Map<
    string,
    GameInvitation
  >();
  private readonly queue: Map<string, string>[] = [];

  isUserInvitable(id: string): string {
    let message: string = undefined;

    this.gameInvitation.forEach((invitation) => {
      if (invitation.getSenderId === id && invitation.hasNotExpired()) {
        message = `You cannot send an invition to an user that is currently sending one, please wait at max ${GAME_INVITATION_TIME_LIMIT} seconds`;
        return;
      } else if (
        invitation.getInvitedUser === id &&
        invitation.hasNotExpired()
      ) {
        message = `That user already received an invitation please wait at max ${GAME_INVITATION_TIME_LIMIT} seconds before sending another one`;
        return;
      }
    });

    return message;
  }

  getInvitation(senderId: string, recipientId: string): GameInvitation {
    const game = this.gameInvitation.get(senderId);

    if (game?.getInvitedUser === recipientId) {
      return game;
    }
    return undefined;
  }

  hasActiveInvitation(id: string): boolean {
    const invitation = this.gameInvitation.get(id);
    return invitation?.hasNotExpired() > 0 ? true : false;
  }

  deleteInvitation(id: string): string {
    const gameId = this.gameInvitation.get(id)?.getGameId;
    this.gameInvitation.delete(id);
    return gameId;
  }

  addNewGameInvitation(
    gameId: string,
    socketId: string,
    userId: string,
    to: string,
  ): number {
    const gameInvit = this.gameInvitation.get(userId);

    if (gameInvit && gameInvit.getInvitedUser !== to) {
      const remainingTime = gameInvit.hasNotExpired();
      if (remainingTime > 0) {
        return remainingTime;
      }
    }

    this.gameInvitation.set(
      userId,
      new GameInvitation(gameId, userId, to, socketId),
    );

    return 0;
  }

  checkIfUserIsQueing(id: string): boolean {
    const res = this.queue.find((map) => map.has(id) === true);

    return res ? true : false;
  }

  checkIfUserIsAlreadyInARoom(id: string): Game | undefined {
    const game = this.games.find((game) => game.getPlayers.includes(id));

    return game;
  }

  createGameRoom(userId: string, socket: SocketWithAuth): string {
    const gameId = PONG_ROOM_PREFIX + userId;

    const game = new Game(gameId, userId, socket.id);

    this.games.push(game);

    socket.join(gameId);

    return gameId;
  }

  addNewGameRoom(data: {
    gameId: string;
    userId: string;
    id: string;
    socketId: string;
    otherSocketId: string;
  }) {
    const { gameId, userId, id, socketId, otherSocketId } = data;
    const game = new Game(gameId, id, socketId);
    game.setOponnentPlayer = userId;
    game.setNewSocketId = otherSocketId;
    game.setGameStarted = true;
    this.games.push(game);
  }

  updateGameByGameId(gameId: string, game: Game) {
    const index = this.games.findIndex((game) => game.getGameId === gameId);

    if (index !== -1) {
      this.games[index] = game;
    }
  }

  getGameByGameId(gameId: string) {
    return this.games.find((game) => game.getGameId === gameId);
  }

  deleteGameRoomByGameId(gameId: string) {
    const index = this.games.findIndex((game) => game.getGameId === gameId);

    if (index === -1) return;

    this.games.splice(index, 1);
  }

  leaveQueue(userId: string) {
    const found = this.queue.findIndex((map) => map.has(userId));

    if (found === -1) return;
  }

  leaveRoom(userId: string) {
    const index = this.games.findIndex((game) =>
      game.getPlayers.includes(userId),
    );

    if (index === -1) return;

    this.games[index].removeUser(userId);
    if (this.games[index].getPlayers.length === 0) {
      this.games.splice(index, 1);
    }
  }

  gameUpdate(server: Server) {
    this.games.forEach((game) => {
      if (game.hasStarted) {
        game.update();
        server
          .to(game.getGameId)
          .emit(PongEvent.UPDATE_GAME, game.getUpdatedData());
      }
    });
  }

  joinGame(server: Server, client: SocketWithAuth, room: string) {
    client.join(room);
    server.to(room).emit(PongEvent.LETS_PLAY, { data: room });
  }

  checkIfMatchupIsPossible(userId: string, socketId: string): string {
    const index = this.games.findIndex((game) => game.getPlayers.length === 1);
    if (index === -1) return undefined;

    this.games[index].setOponnentPlayer = userId;
    this.games[index].setNewSocketId = socketId;
    this.games[index].setGameStarted = true;
    return this.games[index].getGameId;
  }

  updateGameByUserId(game: Game, userId: string) {
    const index = this.games.findIndex((game) =>
      game.getPlayers.includes(userId),
    );

    if (index >= 0) {
      this.games[index] = game;
    }
  }
}
