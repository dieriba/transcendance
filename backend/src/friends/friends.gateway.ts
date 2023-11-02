import { FriendEvent } from './../../../shared/socket.event';
import { WsBadRequestException } from './../common/custom-exception/ws-exception';
import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { FriendsService } from './friends.service';
import { UserService } from 'src/user/user.service';
import { WsAccessTokenGuard } from 'src/common/guards/ws.guard';
import { WsCatchAllFilter } from 'src/common/global-filters/ws-exception-filter';
import { PrismaService } from 'src/prisma/prisma.service';
import { WsNotFoundException } from 'src/common/custom-exception/ws-exception';
import { GatewayService } from 'src/gateway/gateway.service';
import { SocketWithAuth } from 'src/auth/type';
import { IsFriendExistWs } from './pipe/is-friend-exist-ws.pipe';
import { FriendsTypeDto, FriendsTypeNicknameDto } from './dto/friends.dto';
import { UserData } from 'src/common/types/user-info.type';
import { SocketServerResponse } from 'src/common/types/socket-types';
import { TYPE } from '@prisma/client';

@UseGuards(WsAccessTokenGuard)
@UseFilters(WsCatchAllFilter)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway({
  namespace: 'friends',
})
export class FriendsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly userService: UserService,
    private readonly friendService: FriendsService,
    private readonly prismaService: PrismaService,
    private readonly gatewayService: GatewayService,
  ) {}
  private readonly logger = new Logger(FriendsGateway.name);

  @WebSocketServer()
  server: Namespace;

  handleConnection(client: SocketWithAuth) {
    const sockets = this.server.sockets;

    this.logger.log(
      `WS client with id: ${client.id} and userId : ${client.nickname} connected!`,
    );
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.gatewayService.setUserSocket(client.userId, client);
    this.logger.log(
      `Size of socket map ${this.gatewayService.getSockets().size}`,
    );
  }

  handleDisconnect(client: SocketWithAuth) {
    const sockets = this.server.sockets;

    this.logger.log(`WS client with id: ${client.id} disconnected!`);
    //this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.gatewayService.removeUserSocket(client.userId);
  }

  @SubscribeMessage(FriendEvent.REQUEST_SENT)
  async sendFriendRequest(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() body: FriendsTypeNicknameDto,
  ) {
    const { nickname } = body;
    const userId = client.userId;
    console.log({ userId, nickname });
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new WsNotFoundException('User not found');

    const friend = await this.userService.findUserByNickName(
      nickname,
      UserData,
    );

    if (!friend) throw new WsNotFoundException('User not found');

    if (friend.nickname === client.nickname)
      throw new WsBadRequestException("Can't send friend request to myself");

    const friendId = friend.id;

    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      friendId,
    );

    if (existingBlockedUser) {
      const { blockedBy, blockedUsers } = existingBlockedUser;

      if (blockedBy.length && blockedUsers.length)
        throw new WsBadRequestException('You both blocked each other');
      else if (blockedUsers.length > 0)
        throw new WsBadRequestException(
          'Cannot add a user that you have blocked',
        );
      else if (blockedBy.length > 0)
        throw new WsBadRequestException(
          'Cannot add a user that have blocked you',
        );
    }
    const existingFriendShip = await this.friendService.isFriends(
      userId,
      friendId,
    );

    if (existingFriendShip)
      throw new WsBadRequestException('You are already friend with that user');

    const existingFriendRequest =
      await this.friendService.isAlreadyFriendsRequestSent(userId, friendId);

    this.logger.log({ existingFriendRequest });

    if (existingFriendRequest) {
      if (existingFriendRequest.senderId != userId)
        throw new WsBadRequestException(
          'That user already send you a friend request',
        );
      else
        throw new WsBadRequestException(
          'You already sent a friend request to that user',
        );
    }

    const request = await this.prismaService.friendRequest.create({
      data: {
        sender: {
          connect: {
            id: userId,
          },
        },
        recipient: {
          connect: {
            id: friendId,
          },
        },
      },
    });

    this.sendToSocket(client, friendId, FriendEvent.REQUEST_RECEIVED, {
      message: `You received a friend request from ${client.nickname}`,
      data: {
        createdAt: request.createdAt,
        sender: {
          nickname: client.nickname,
          id: client.userId,
          profile: { avatar: user.profile?.avatar },
        },
      },
    });

    client.emit(FriendEvent.REQUEST_SENT, {
      message: 'Friend request succesfully sent',
      data: {
        recipient: {
          nickname: friend.nickname,
          id: friend.id,
          profile: { avatar: friend.profile?.avatar },
        },
      },
    });
  }

  @SubscribeMessage(FriendEvent.CANCEL_REQUEST)
  async cancelFriendRequest(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const userId = client.userId;

    const existingFriendRequest = await this.friendService.isRequestBetweenUser(
      userId,
      friendId,
    );

    if (!existingFriendRequest)
      throw new WsBadRequestException(
        'There is not friend request between you and that user to cancel',
      );

    const existingFriendship = await this.friendService.isFriends(
      userId,
      friendId,
    );

    if (existingFriendship)
      throw new WsBadRequestException('You are friends with that user');

    await this.prismaService.friendRequest.delete({
      where: {
        senderId_recipientId: {
          senderId: existingFriendRequest.senderId,
          recipientId: existingFriendRequest.recipientId,
        },
      },
    });

    console.log({ friendId });

    this.sendToSocket(client, friendId, FriendEvent.CANCEL_REQUEST, {
      message: '',
      data: { friendId: client.userId },
    });

    client.emit(FriendEvent.CANCEL_REQUEST, {
      message: 'Friend request declined succesfully',
      data: {
        friendId,
      },
    });
  }

  @SubscribeMessage(FriendEvent.REQUEST_ACCEPTED)
  async acceptFriend(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const userId = client.userId;

    const existingFriendship = await this.friendService.isFriends(
      userId,
      friendId,
    );
    this.logger.log({ existingFriendship });

    if (existingFriendship)
      throw new WsBadRequestException('You are already friends with that user');

    const existingFriendRequest =
      await this.friendService.hasUserSentMeARequest(friendId, userId);

    if (!existingFriendRequest)
      throw new WsBadRequestException('User has not send you a friend request');

    /*MAYBE CHECK IF USER HAS BLOCKED ME*/

    const { sender, recipient } = existingFriendRequest;

    await this.prismaService.$transaction([
      this.prismaService.friendRequest.delete({
        where: {
          senderId_recipientId: {
            senderId: existingFriendRequest.senderId,
            recipientId: existingFriendRequest.recipientId,
          },
        },
      }),
      this.prismaService.chatroom.create({
        data: {
          type: TYPE.DM,
          users: {
            create: [{ userId: userId }, { userId: friendId }],
          },
        },
      }),
      this.prismaService.friends.create({
        data: {
          user: { connect: { id: userId } },
          friend: { connect: { id: friendId } },
        },
      }),
      this.prismaService.friends.create({
        data: {
          user: { connect: { id: friendId } },
          friend: { connect: { id: userId } },
        },
      }),
    ]);

    this.sendToSocket(client, friendId, FriendEvent.REQUEST_ACCEPTED, {
      message: `${client.nickname} accepted your friend request`,
      data: { friendId: client.userId },
    });

    this.sendToSocket(client, friendId, FriendEvent.NEW_FRIEND, {
      message: '',
      data: {
        friend: {
          id: sender.id === friendId ? recipient.id : friendId,
          nickname:
            sender.id === friendId ? recipient.nickname : sender.nickname,
          profile: {
            avatar:
              sender.id === friendId
                ? recipient.profile.avatar
                : sender.profile.avatar,
          },
        },
      },
    });

    client.emit(FriendEvent.NEW_FRIEND, {
      message: '',
      data: {
        friend: {
          id: sender.id === client.userId ? recipient.id : friendId,
          nickname:
            sender.id === client.userId ? recipient.nickname : sender.nickname,
          profile: {
            avatar:
              sender.id === client.userId
                ? recipient.profile.avatar
                : sender.profile.avatar,
          },
        },
      },
    });

    client.emit(FriendEvent.REQUEST_ACCEPTED, {
      message: `You are now friend with ${
        friendId === sender.id ? sender.nickname : recipient.nickname
      }`,
      data: { friendId },
    });
  }

  @SubscribeMessage(FriendEvent.DELETE_FRIEND)
  async deleteFriends(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const { userId } = client;

    const existingFriendship = await this.friendService.isFriends(
      userId,
      friendId,
    );

    if (!existingFriendship)
      throw new WsBadRequestException(
        'You cannot delete user that are not your friend with',
      );

    await this.prismaService.$transaction([
      this.prismaService.friends.delete({
        where: {
          userId_friendId: { userId, friendId },
        },
      }),
      this.prismaService.friends.delete({
        where: {
          userId_friendId: { userId: friendId, friendId: userId },
        },
      }),
    ]);

    this.sendToSocket(client, friendId, FriendEvent.DELETE_FRIEND, {
      message: '',
      data: { friendId: client.userId },
    });

    client.emit(FriendEvent.DELETE_FRIEND, { message: '', data: { friendId } });
  }

  @SubscribeMessage(FriendEvent.BLOCK_FRIEND)
  async blockUser(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const userId = client.userId;

    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      friendId,
    );

    if (existingBlockedUser && existingBlockedUser.blockedUsers.length > 0)
      throw new WsBadRequestException('User already blocked');

    const existingFriendShip = await this.friendService.isFriends(
      userId,
      friendId,
    );

    this.logger.log({ existingFriendShip });

    const existingFriendRequest = await this.friendService.isRequestBetweenUser(
      userId,
      friendId,
    );

    if (existingFriendShip) {
      await this.prismaService.$transaction([
        this.prismaService.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: friendId } } },
        }),
        this.prismaService.friends.delete({
          where: {
            userId_friendId: {
              userId,
              friendId,
            },
          },
        }),
        this.prismaService.friends.delete({
          where: {
            userId_friendId: {
              userId: friendId,
              friendId: userId,
            },
          },
        }),
      ]);
      this.sendToSocket(client, friendId, FriendEvent.DELETE_FRIEND, {
        message: '',
        data: { friendId: client.userId },
      });

      client.emit(FriendEvent.DELETE_FRIEND, {
        message: '',
        data: { friendId },
      });
    } else if (existingFriendRequest) {
      await this.prismaService.$transaction([
        this.prismaService.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: friendId } } },
        }),
        this.prismaService.friendRequest.delete({
          where: {
            senderId_recipientId: {
              senderId: existingFriendRequest.senderId,
              recipientId: existingFriendRequest.recipientId,
            },
          },
        }),
      ]);
      client.emit(FriendEvent.CANCEL_REQUEST, {
        message: '',
        data: { friendId },
      });
      this.sendToSocket(client, friendId, FriendEvent.CANCEL_REQUEST, {
        message: '',
        data: { friendId: client.userId },
      });
    } else {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { blockedUsers: { connect: { id: friendId } } },
      });
    }
  }

  @SubscribeMessage(FriendEvent.UNBLOCK_FRIEND)
  async unblockUser(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const { userId } = client;

    const user = this.userService.findUserById(userId, UserData);

    if (!user) throw new WsNotFoundException('User not found');

    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      friendId,
    );

    if (existingBlockedUser && existingBlockedUser.blockedUsers.length > 0) {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { blockedUsers: { disconnect: { id: friendId } } },
      });

      client.emit(FriendEvent.UNBLOCK_FRIEND, {
        message: '',
        data: { friendId },
      });
    }
  }

  private sendToSocket(
    client: SocketWithAuth,
    userId: string,
    emit: string,
    object: SocketServerResponse,
  ) {
    const socket = this.gatewayService.getUserSocket(userId);

    if (!socket) return;

    this.logger.log('Socket id is: ', socket ? socket.id : 'undefined');

    client.to(socket.id).emit(emit, object);
  }
}
