import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Game } from '../../../shared/Game';
import { SocketWithAuth } from 'src/auth/type';
import { PongEvent } from '../../../shared/socket.event';

@Injectable()
export class PongService {
  private readonly games: Game[] = [];

  checkIfUserIsAlreadyInAGame(id: string): boolean {
    const game = this.games.find((game) => game.getPlayers.includes(id));
    console.log({ gameLength: this.games.length, game: this.games[0] });

    return game ? true : false;
  }

  createGameRoom(userId: string, socket: SocketWithAuth): string {
    const gameId = 'pong_' + userId;
    console.log('new room');

    const game = new Game(userId, gameId);

    const len = this.games.push(game);
    console.log({ newLen: len, len: this.games.length, game: this.games[0] });

    socket.join(gameId);

    return gameId;
  }

  deleteGameRoomByGameId(gameId: string) {
    const index = this.games.findIndex((game) => game.getGameId === gameId);

    if (index === -1) return;

    this.games.splice(index, 1);
  }

  leaveRoom(userId: string): string {
    const index = this.games.findIndex((game) =>
      game.getPlayers.includes(userId),
    );

    if (index === -1) return;
    console.log('room leaved');

    this.games[index].removeUser(userId);
    if (this.games[index].getPlayers.length === 0) {
      console.log('room deleted');

      this.games.splice(index, 1);
    }
  }

  gameUpdate() {
    this.games.forEach((game) => {
      if (game.hasStarted) {
        game.update();
      }
    });
  }

  checkIfMatchupIsPossible(server: Server, client: SocketWithAuth): boolean {
    const index = this.games.findIndex((game) => game.getPlayers.length === 1);
    if (index === -1) return false;

    const { userId } = client;
    const { getGameId } = this.games[index];
    this.games[index].oponnentPlayer = userId;
    client.join(getGameId);
    server
      .to(getGameId)
      .emit(PongEvent.GO_WAITING_ROOM, { data: this.games[index] });

    return true;
  }
}
