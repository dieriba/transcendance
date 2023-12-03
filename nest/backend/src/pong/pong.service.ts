import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { SocketWithAuth } from 'src/auth/type';
import { PONG_ROOM_PREFIX, PongEvent } from '../../shared/socket.event';
import { GAME_INVITATION_TIME_LIMIT } from '../../shared/constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { Game, GameInvitation } from './class/Game';
import { LibService } from 'src/lib/lib.service';
import { PlayerStartGameInfo, StartGameInfo } from 'shared/types';

@Injectable()
export class PongService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly libService: LibService,
  ) {}
  private readonly games: Game[] = [];
  private readonly gameInvitation: Map<string, GameInvitation> = new Map<
    string,
    GameInvitation
  >();
  private readonly queue: Map<string, string>[] = [];

  async getLeaderboard(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new UserNotFoundException();

    const players = await this.prismaService.user.findMany({
      orderBy: { pong: { rating: 'desc' } },
      select: {
        id: true,
        nickname: true,
        profile: true,
        pong: true,
        status: true,
        friends: {
          where: {
            userId,
          },
        },
        blockedBy: {
          where: {
            id: userId,
          },
        },
        blockedUsers: {
          where: {
            id: userId,
          },
        },
      },
    });

    return players;
  }

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
    game.startGame();
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

  async gameUpdate(server: Server) {
    this.games.forEach(async (game, index) => {
      if (game.hasStarted) {
        if (!game.endGame()) {
          game.update();
          this.libService.sendToSocket(
            server,
            game.getGameId,
            PongEvent.UPDATE_GAME,
            {
              data: game.getUpdatedData(),
            },
          );
          return;
        }

        let data = { message: 'Draw' };

        if (!game.getDraw) {
          data = await this.setPongWinner(
            game.getWinner.getPlayerId,
            game.getLooser.getPlayerId,
          );
        }

        this.libService.sendToSocket(
          server,
          game.getGameId,
          PongEvent.END_GAME,
          { data },
        );

        this.deleteGameRoomByIndex(index);
        this.libService.deleteSocketRoom(server, game.getGameId);
      }
    });
  }

  private async setPongWinner(
    winnerId: string,
    looserId: string,
  ): Promise<{ message: string | undefined }> {
    const winner = await this.prismaService.user.findFirst({
      where: { id: winnerId },
      select: {
        nickname: true,
        pong: true,
        profile: true,
      },
    });
    const looser = await this.prismaService.user.findFirst({
      where: { id: looserId },
      select: {
        nickname: true,
        pong: true,
        profile: true,
      },
    });

    if (!winner || !looser) return { message: undefined };

    await this.prismaService.$transaction(async (tx) => {
      await tx.pong.upsert({
        where: { userId: looserId },
        create: { userId: looserId, losses: 1 },
        update: { losses: { increment: 1 } },
      });

      await this.prismaService.pong.upsert({
        where: { userId: winnerId },
        create: {
          victory: 1,
          winnedGame: {
            create: {
              looser: { connect: { userId: looserId } },
            },
          },
        },
        update: {
          victory: { increment: 1 },
          rating: { increment: 10 },
          winnedGame: { create: { looser: { connect: { userId: looserId } } } },
        },
      });
    });

    return { message: `${winner.nickname} won the game` };
  }

  joinGame(
    server: Server,
    client: SocketWithAuth,
    room: string,
    {
      creator,
      opponent,
    }: { creator: PlayerStartGameInfo; opponent: PlayerStartGameInfo },
  ) {
    client.join(room);
    const data: StartGameInfo = {
      room,
      creator,
      opponent,
    };

    server.to(room).emit(PongEvent.LETS_PLAY, {
      data,
    });
  }

  async checkIfMatchupIsPossible(
    userId: string,
    socketId: string,
  ): Promise<
    { room?: string; creator: PlayerStartGameInfo | undefined } | undefined
  > {
    const index = this.games.findIndex((game) => game.getPlayers.length === 1);
    if (index === -1) return undefined;

    const creator = await this.prismaService.user.findFirst({
      where: { id: this.games[index].getPlayer.getPlayerId },
      include: { profile: true },
    });

    if (!creator) {
      this.deleteGameRoomByIndex(index);
      return { creator: undefined };
    }

    this.games[index].setOponnentPlayer = userId;
    this.games[index].setNewSocketId = socketId;
    this.games[index].startGame();
    return {
      room: this.games[index].getGameId,
      creator: { nickname: creator.nickname, avatar: creator.profile.avatar },
    };
  }

  updateGameByUserId(game: Game, userId: string) {
    const index = this.games.findIndex((game) =>
      game.getPlayers.includes(userId),
    );

    if (index >= 0) {
      this.games[index] = game;
    }
  }

  private deleteGameRoomByIndex(index: number) {
    this.games.splice(index, 1);
  }
}
