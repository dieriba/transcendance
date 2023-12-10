import { STATUS } from '@prisma/client';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PONG_ROOM_PREFIX, PongEvent } from '../../shared/socket.event';
import {
  GAME_INVITATION_TIME_LIMIT,
  PongGameType,
  PongTypeNormal,
  keyPressedType,
} from '../../shared/constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { LibService } from 'src/lib/lib.service';
import { PlayerStartGameInfo, StartGameInfo } from 'shared/types';
import { GameInvitation } from './class/GameInvitation';
import { IPongGame } from './class/IGame';
import { BasicPongGame } from './class/BasicPongGame';
import { SpecialPongGame } from './class/SpecialPongGame';
import { SocketWithAuth } from 'src/auth/type';
import { WsUnknownException } from 'src/common/custom-exception/ws-exception';

@Injectable()
export class PongService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly libService: LibService,
  ) {}
  private readonly gameLeavers: Map<string, boolean> = new Map<
    string,
    boolean
  >();
  private readonly games: IPongGame[] = [];
  private readonly gameInvitation: Map<string, GameInvitation> = new Map<
    string,
    GameInvitation
  >();
  private readonly queue: Map<string, string>[] = [];

  static createGameBasedOnType(
    gameId: string,
    playerId: string,
    socketId: string,
    pongType: PongGameType,
  ) {
    if (pongType === PongTypeNormal)
      return new BasicPongGame(gameId, playerId, socketId);

    return new SpecialPongGame(gameId, playerId, socketId);
  }

  async getLeaderboard(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new UserNotFoundException();

    const players = await this.prismaService.user.findMany({
      orderBy: [{ pong: { rating: 'desc' } }],
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
    pongType: PongGameType,
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
      new GameInvitation(gameId, userId, to, socketId, pongType),
    );

    return 0;
  }

  checkIfUserIsQueing(id: string): boolean {
    const res = this.queue.find((map) => map.has(id) === true);

    return res ? true : false;
  }

  checkIfUserIsAlreadyInARoom(id: string): IPongGame | undefined {
    const game = this.games.find((game) => game.getPlayers.includes(id));

    return game;
  }

  createGameRoom(
    userId: string,
    socketId: string,
    pongGameType: PongGameType,
  ): string {
    const gameId = PONG_ROOM_PREFIX + userId;

    this.games.push(
      PongService.createGameBasedOnType(gameId, userId, socketId, pongGameType),
    );

    return gameId;
  }

  addNewGameRoom(data: {
    gameId: string;
    userId: string;
    id: string;
    socketId: string;
    otherSocketId: string;
    pongGameType: PongGameType;
  }) {
    const { gameId, userId, id, socketId, otherSocketId, pongGameType } = data;
    const game = PongService.createGameBasedOnType(
      gameId,
      id,
      socketId,
      pongGameType,
    );
    game.setOponnentPlayerId = userId;
    game.setNewSocketId = otherSocketId;
    game.startGame();
    this.games.push(game);
  }

  hasUserLeavedGame(userId: string) {
    return this.gameLeavers.get(userId);
  }

  setGameLeaver(userId: string, leaver: boolean) {
    this.gameLeavers.set(userId, leaver);
  }

  updateGameByGameId(gameId: string, game: IPongGame) {
    const index = this.games.findIndex((game) => game.getGameId === gameId);

    if (index !== -1) {
      this.games[index] = game;
    }
  }

  updateGamePlayerPosition(
    index: number,
    userId: string,
    direction: keyPressedType,
  ) {
    this.games[index].updatePlayerPosition(userId, direction);
  }

  getGameByGameIdAndReturnIndex(
    gameId: string,
  ): [game: IPongGame | undefined, index: number] {
    const index = this.games.findIndex((game) => game.getGameId === gameId);

    return [index === -1 ? undefined : this.games[index], index];
  }

  getGameByGameId(gameId: string) {
    return this.games.find((game) => game.getGameId === gameId);
  }

  deleteGameRoomByGameId(gameId: string, server?: Server) {
    const index = this.games.findIndex((game) => game.getGameId === gameId);

    if (index === -1) return;

    if (server) {
      const socketIds = this.games[index].getSocketIds;

      socketIds.map((id) => {
        const socket = this.libService.getSocket(server, id);

        socket?.leave(gameId);
      });
    }

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
    for (const [index, game] of this.games.entries()) {
      if (game.hasStarted) {
        game.update();
        this.libService.sendToSocket(
          server,
          game.getGameId,
          PongEvent.UPDATE_GAME,
          {
            data: game.getUpdatedData(),
          },
        );
        if (game.endGame()) {
          let data = { message: 'Draw' };
          const winnerId = game.getWinner.getPlayerId;
          const looserId = game.getLooser.getPlayerId;
          if (!game.getDraw) {
            data = await this.setPongWinner(winnerId, looserId);
          }

          this.libService.sendToSocket(
            server,
            game.getGameId,
            PongEvent.END_GAME,
            { data },
          );
          this.deleteGameRoomByIndex(index, server);
          this.libService.deleteSocketRoom(server, game.getGameId);
          this.libService.updateUserStatus(server, {
            ids: [winnerId, looserId],
            status: STATUS.ONLINE,
          });
        }
      }
    }
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
      await tx.user.update({
        where: { id: winnerId },
        data: { status: STATUS.ONLINE },
      });

      await tx.user.update({
        where: { id: looserId },
        data: { status: STATUS.ONLINE },
      });

      await tx.pong.upsert({
        where: { userId: looserId },
        create: { userId: looserId, losses: 1 },
        update: { losses: { increment: 1 } },
      });

      await tx.pong.upsert({
        where: { userId: winnerId },
        create: {
          userId: winnerId,
          victory: 1,
          rating: 10,
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

  async joinGame(
    server: Server,
    room: string,
    {
      creator,
      opponent,
    }: { creator: PlayerStartGameInfo; opponent: PlayerStartGameInfo },
    userId: string,
    creatorId: string,
    mySocket: SocketWithAuth,
    otherSocket: SocketWithAuth,
  ) {
    const data: StartGameInfo = {
      room,
      creator,
      opponent,
    };

    try {
      await this.prismaService.$transaction([
        this.prismaService.user.update({
          where: { id: userId },
          data: { status: STATUS.PLAYING },
        }),
        this.prismaService.user.update({
          where: { id: creatorId },
          data: { status: STATUS.PLAYING },
        }),
      ]);
    } catch (error) {
      this.deleteGameRoomByGameId(room);
      throw new WsUnknownException('error');
    }

    this.libService.updateUserStatus(server, {
      ids: [userId, creator.id as string],
      status: STATUS.PLAYING,
    });

    mySocket.join(room);
    otherSocket.join(room);

    server.to(room).emit(PongEvent.LETS_PLAY, {
      data,
    });
  }

  async checkIfMatchupIsPossible(
    userId: string,
    socketId: string,
    pongType: PongGameType,
  ): Promise<
    { room?: string; creator: PlayerStartGameInfo | undefined } | undefined
  > {
    const index = this.games.findIndex((game) => game.getPlayers.length === 1);
    if (index === -1 || pongType !== this.games[index].getPongType)
      return undefined;

    const creator = await this.prismaService.user.findFirst({
      where: { id: this.games[index].getPlayer.getPlayerId },
      include: { profile: true },
    });

    if (!creator) {
      this.deleteGameRoomByIndex(index);
      return { creator: undefined };
    }

    const creatorSocketId = this.games[index].getSocketIds[0] ?? undefined;

    this.games[index].setOponnentPlayerId = userId;
    this.games[index].setNewSocketId = socketId;
    this.games[index].startGame();
    return {
      room: this.games[index].getGameId,
      creator: {
        id: creator.id,
        nickname: creator.nickname,
        avatar: creator.profile.avatar,
        socketId: creatorSocketId,
      },
    };
  }

  updateGameByUserId(game: IPongGame, userId: string) {
    const index = this.games.findIndex((game) =>
      game.getPlayers.includes(userId),
    );

    if (index >= 0) {
      this.games[index] = game;
    }
  }

  private deleteGameRoomByIndex(index: number, server?: Server) {
    const { getSocketIds, getGameId } = this.games[index];
    if (this.games[index]) {
      if (server) {
        getSocketIds.map((id) => {
          const socket = this.libService.getSocket(server, id);

          socket?.leave(getGameId);
        });
      }

      this.games.splice(index, 1);
    }
  }
}
