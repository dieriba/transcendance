import {
  UseGuards,
  UseFilters,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ROLE, TYPE, RESTRICTION, STATUS } from '@prisma/client';
import {
  ChatEventPrivateRoom,
  FriendEvent,
  GeneralEvent,
  ChatEventGroup,
  PongEvent,
  PONG_ROOM_PREFIX,
} from '../../shared/socket.event';
import { Server } from 'socket.io';
import { Argon2Service } from 'src/argon2/argon2.service';
import { SocketWithAuth } from 'src/auth/type';
import {
  ChatroomDataDto,
  DieribaDto,
  ChangeUserRoleDto,
  RestrictedUsersDto,
  UnrestrictedUsersDto,
  JoinChatroomDto,
  ChatroomMessageDto,
  DmMessageDto,
  ChatRoomDto,
  EditChatroomDto,
  ChatroomIdDto,
  ChatroomIdWithUserIdDto,
  ChatroomIdWithUserNicknameDto,
} from 'src/chat/dto/chatroom.dto';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import {
  WsBadRequestException,
  WsUnknownException,
  WsUnauthorizedException,
  WsNotFoundException,
  WsUserNotFoundException,
  WsChatroomNotFoundException,
  WsGameNotFoundException,
} from 'src/common/custom-exception/ws-exception';
import { WsCatchAllFilter } from 'src/common/global-filters/ws-exception-filter';
import { WsAccessTokenGuard } from 'src/common/guards/ws.guard';
import { ChatroomBaseData } from 'src/common/types/chatroom-info-type';
import { UserData } from 'src/common/types/user-info.type';
import { LibService } from 'src/lib/lib.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import {
  FriendsTypeNicknameDto,
  FriendsTypeDto,
} from 'src/friends/dto/friends.dto';
import { IsFriendExistWs } from 'src/friends/pipe/is-friend-exist-ws.pipe';
import { FriendsService } from 'src/friends/friends.service';
import { CheckGroupCreationValidity } from 'src/chat/pipes/check-group-creation-validity.pipe';
import { ChatRoute } from 'src/common/custom-decorator/metadata.decorator';
import { IsRestrictedUserGuardWs } from 'src/chat/guards/is-restricted-user.guard.ws';
import { AvatarUpdateDto } from 'src/user/dto/AvatarUpdate.dto';
import { UserIdDto, UserInfoUpdateDto } from 'src/user/dto/UserInfo.dto';
import { PongService } from 'src/pong/pong.service';
import { Interval } from '@nestjs/schedule';
import {
  FRAME_RATE,
  GAME_INVITATION_TIME_LIMIT,
  PongTypeNormal,
} from '../../shared/constant';
import {
  GameIdDto,
  GameInvitationDto,
  PongGameTypeDto,
  UpdatePlayerPositionDto,
} from 'src/pong/dto/dto';

@UseGuards(WsAccessTokenGuard)
@UseFilters(WsCatchAllFilter)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway()
export class GatewayGateway {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatroomService: ChatroomService,
    private readonly chatroomUserService: ChatroomUserService,
    private readonly argon2Service: Argon2Service,
    private readonly libService: LibService,
    private readonly friendService: FriendsService,
    private readonly pongService: PongService,
  ) {}

  private readonly logger = new Logger(GatewayGateway.name);

  @WebSocketServer()
  server: Server;
  /*----------------------------------------------------------------------------- */
  async handleConnection(client: SocketWithAuth) {
    const { sockets } = this.server.sockets;
    const { id, userId } = client;
    this.logger.log(
      `WS client with id: ${id} and userId : ${userId} connected!`,
    );
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    client.join(client.userId);
    const rooms = this.server.of('/').adapter.rooms;
    console.log({ rooms });

    const room = this.getAllSockeIdsByKey(userId);

    if (room.size === 1) {
      const user = await this.userService.findUserById(userId, UserData);

      if (!user) {
        client.disconnect();
        return;
      }

      await this.userService.updateUserById(userId, {
        status: STATUS.ONLINE,
      });

      this.libService.updateUserStatus(this.server, {
        ids: [userId],
        status: STATUS.ONLINE,
      });

      if (user.firstConnection) {
        const {
          id,
          status,
          pong,
          nickname,
          profile: { firstname, lastname, avatar },
        } = user;
        this.libService.sendToSocket(
          this.server,
          GeneralEvent.BROADCAST,
          PongEvent.NEW_PLAYER,
          {
            data: {
              id,
              status,
              pong,
              nickname,
              profile: { avatar, firstname, lastname },
            },
          },
        );

        await this.userService.updateUserById(userId, {
          firstConnection: false,
        });
      }
    }

    if (this.pongService.hasUserLeavedGame(userId)) {
      this.libService.emitBackToMyself(client, GeneralEvent.DESERTER, {
        message: 'You leaved a game! shame on you',
        severity: 'warning',
      });
      this.pongService.setGameLeaver(userId, false);
    }
  }

  async handleDisconnect(client: SocketWithAuth) {
    const { sockets } = this.server.sockets;
    const { userId } = client;

    this.logger.log(`WS client with id: ${client.id} disconnected!`);
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);

    if (!this.getAllSockeIdsByKey(userId)) {
      console.log('LOGGED OUT');
      this.libService.updateUserStatus(this.server, {
        ids: [userId],
        status: STATUS.OFFLINE,
      });

      const user = await this.userService.findUserById(userId, UserData);

      if (!user) throw new WsUserNotFoundException();

      await this.userService.updateUserById(userId, {
        status: STATUS.OFFLINE,
      });
    }

    const game = this.pongService.checkIfUserIsAlreadyInARoom(userId);

    if (game) {
      if (game.hasStarted) {
        this.libService.sendToSocket(
          this.server,
          game.getGameId,
          PongEvent.USER_NO_MORE_IN_GAME,
          {
            severity: 'info',
            message:
              'Redirecting you to game page as your adversary leaved the game',
          },
        );

        this.pongService.setGameLeaver(userId, true);

        const id =
          userId !== game.getPlayer.getPlayerId
            ? game.getPlayer.getPlayerId
            : game.getOppenent.getPlayerId;

        const user = await this.userService.findUserById(id, UserData);

        if (user) {
          const online = this.getAllSockeIdsByKey(id);

          this.libService.updateUserStatus(this.server, {
            ids: [id],
            status: online ? STATUS.ONLINE : STATUS.OFFLINE,
          });

          await this.prismaService.user.update({
            where: { id },
            data: { status: online ? STATUS.ONLINE : STATUS.OFFLINE },
          });
        }
      }
      this.pongService.deleteGameRoomByGameId(game.getGameId);
      this.deleteAllSocketIdsBy(game.getGameId);
    }
  }

  @SubscribeMessage(GeneralEvent.DISCONNECT_ALL_INSTANCE_OF_ME)
  async disconnectAllInstanceOfMe(@ConnectedSocket() client: SocketWithAuth) {
    const { userId } = client;

    if (!this.getAllSockeIdsByKey(userId))
      throw new WsBadRequestException('User not online');

    this.libService.sendToSocket(client, userId, GeneralEvent.DISCONNECT_ME);
    this.libService.sendToSocket(this.server, client.id, GeneralEvent.SUCCESS);
    this.deleteAllSocketIdsBy(userId);
  }

  @SubscribeMessage(GeneralEvent.DISCONNECT_ALL_EXCEPT_ME)
  async disconnectAllExceptMe(@ConnectedSocket() client: SocketWithAuth) {
    const { userId } = client;

    if (!this.getAllSockeIdsByKey(userId)) {
      this.libService.sendToSocket(
        this.server,
        client.id,
        GeneralEvent.SUCCESS,
      );
      return;
    }
    this.libService.sendToSocket(client, userId, GeneralEvent.DISCONNECT_ME);
    this.libService.sendToSocket(this.server, client.id, GeneralEvent.SUCCESS);
  }

  @SubscribeMessage(GeneralEvent.NEW_PROFILE_PICTURE)
  async notifyUserForNewUserProfilePic(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() avatarUpdateDto: AvatarUpdateDto,
  ) {
    const { userId } = client;
    const { avatar } = avatarUpdateDto;

    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new WsUserNotFoundException();

    this.libService.sendToSocket(
      this.server,
      GeneralEvent.BROADCAST,
      GeneralEvent.USER_CHANGED_AVATAR,
      {
        data: {
          id: userId,
          avatar,
        },
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS);
  }

  @SubscribeMessage(GeneralEvent.UPDATE_USER_PROFILE)
  async updateUserInfo(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() userInfoUpdateDto: UserInfoUpdateDto,
  ) {
    const { userId } = client;

    const user = await this.userService.findUserById(userId, UserData);

    if (!user) {
      throw new WsUserNotFoundException();
    }

    const { nickname } = userInfoUpdateDto;

    const isNicknameTaken = await this.userService.findUserByNickName(
      nickname,
      UserData,
    );

    if (isNicknameTaken)
      throw new WsBadRequestException('Nickname is already taken');

    if (nickname === user.nickname) {
      throw new WsBadRequestException('Nickname already taken by you, btw...');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: { ...userInfoUpdateDto },
    });

    this.libService.sendToSocket(
      this.server,
      GeneralEvent.BROADCAST,
      GeneralEvent.USER_CHANGED_USERNAME,
      {
        data: { id: userId, nickname },
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: 'Profile updated ',
      data: { nickname },
    });
  }

  @SubscribeMessage(ChatEventGroup.CREATE_GROUP_CHATROOM)
  async createChatroom(
    @MessageBody(CheckGroupCreationValidity) chatroomDto: ChatRoomDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { users, ...chatroom } = chatroomDto;
    const { chatroomName } = chatroom;
    const { userId } = client;

    const friendsArr = users ?? [];

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        nickname: true,
        friends: {
          where: {
            friendId: {
              in: friendsArr,
            },
          },
          select: {
            friendId: true,
          },
        },
      },
    });

    if (!user) throw new WsUserNotFoundException();

    this.logger.log(
      `Attempting to create the chatroom: ${chatroomName} who will be owned by ${user.nickname}`,
    );

    const chatRoom = await this.prismaService.chatroom.findFirst({
      where: { chatroomName },
    });

    if (chatRoom)
      throw new WsBadRequestException(
        `The chatroom name: ${chatroomName} is already taken`,
      );

    const existingUserId = user.friends.map((friend) => friend.friendId);

    existingUserId.push(userId);

    const newChatroom = await this.prismaService.chatroom.create({
      data: {
        ...chatroom,
        users: {
          create: existingUserId.map((id) => ({
            user: {
              connect: { id },
            },
            role: userId === id ? ROLE.DIERIBA : ROLE.REGULAR_USER,
          })),
        },
      },
      select: {
        id: true,
        chatroomName: true,
        type: true,
      },
    });

    const { type } = newChatroom;

    existingUserId.map((id) => {
      this.libService.sendToSocket(
        this.server,
        id,
        ChatEventGroup.NEW_CHATROOM,
        {
          data: {
            id: newChatroom.id,
            chatroomName,
            type,
            messages: [],
            restrictedUsers: [],
          },
        },
      );

      this.joinOrLeaveRoom(id, GeneralEvent.JOIN, chatroomName);

      if (id === userId) {
        this.libService.sendToSocket(this.server, id, GeneralEvent.SUCCESS, {
          message: 'Group created succesfully',
        });
      }
    });

    if (newChatroom.type === TYPE.PUBLIC || newChatroom.type === TYPE.PROTECTED)
      this.libService.sendToSocket(
        this.server,
        GeneralEvent.BROADCAST,
        ChatEventGroup.NEW_AVAILABLE_CHATROOM,
        {
          data: {
            id: newChatroom.id,
            type: newChatroom.type,
            chatroomName: newChatroom.chatroomName,
          },
        },
      );
  }

  @SubscribeMessage(ChatEventGroup.EDIT_GROUP_CHATROOM)
  async editChatroom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() editChatroomDto: EditChatroomDto,
  ) {
    const { chatroomId, ...data } = editChatroomDto;
    const { userId } = client;
    const { type, password } = data;
    if (type === TYPE.PROTECTED && password === undefined)
      throw new WsBadRequestException(
        'Protected room must have a password set',
      );
    if (password !== undefined) {
      if (type !== TYPE.PROTECTED)
        throw new WsBadRequestException(
          'Only protected chatroom can set password',
        );
    }

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
      },
      select: {
        chatroomName: true,
        type: true,
        password: true,
        users: {
          where: {
            role: ROLE.DIERIBA,
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (!chatroom) throw new WsChatroomNotFoundException();

    if (type !== TYPE.PROTECTED && chatroom.type === type)
      throw new WsBadRequestException('Chatroom already of that type');

    if (chatroom.users[0].userId !== userId)
      throw new WsUnauthorizedException(
        'Only chatroom admin can edit the chatroom',
      );

    if (type === TYPE.PROTECTED) {
      if (chatroom.type === TYPE.PROTECTED) {
        const isSame = await this.argon2Service.compare(
          chatroom.password,
          password,
        );

        if (isSame)
          throw new WsBadRequestException(
            'Password is currently the room password',
          );
      }
      data.password = await this.argon2Service.hash(password);
    } else {
      if (chatroom.type === type)
        throw new WsBadRequestException(
          `Chatroom setting already set to ${type}`,
        );
      data.password = null;
    }

    const chat = await this.chatroomService.updateChatroom(chatroomId, data);

    this.libService.sendToSocket(
      client,
      chatroom.chatroomName,
      ChatEventGroup.UPDATED_GROUP_CHATROOM,
      {
        message: `${chatroom.chatroomName} is now ${type}`,
        data: { chatroomId, type },
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: 'Group edited succesflly',
      data: { chatroomId, type },
    });

    if (type !== TYPE.PRIVATE) {
      this.libService.sendToSocket(
        this.server,
        GeneralEvent.BROADCAST,
        ChatEventGroup.NEW_AVAILABLE_CHATROOM,
        {
          data: {
            id: chatroomId,
            type: type,
            chatroomName: chat.chatroomName,
          },
        },
      );
    } else {
      this.libService.sendToSocket(
        this.server,
        GeneralEvent.BROADCAST,
        ChatEventGroup.DELETE_JOINABLE_GROUP,
        {
          data: { chatroomId },
        },
      );
    }
  }

  @SubscribeMessage(ChatEventGroup.ADD_INVITE_USER)
  async addOrInviteUser(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { nickname, chatroomId }: ChatroomIdWithUserNicknameDto,
  ) {
    const { userId } = client;

    const [chatroom, adminNickname] = await Promise.all([
      this.prismaService.chatroom.findFirst({
        where: { id: chatroomId },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              chatroomId: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  profile: {
                    select: {
                      avatar: true,
                    },
                  },
                },
              },
              createdAt: true,
              content: true,
            },
          },
        },
      }),
      this.isDieriba(userId, chatroomId),
    ]);

    if (!chatroom) throw new WsNotFoundException('Chatroom does not exist');

    const { chatroomName, type } = chatroom;

    const user = await this.prismaService.user.findFirst({
      where: {
        nickname,
      },
      select: {
        id: true,
        nickname: true,
        status: true,
        profile: {
          select: {
            avatar: true,
          },
        },
        friends: {
          select: {
            friendId: true,
          },
        },
        groupParameter: true,
        chatrooms: {
          where: {
            chatroomId,
          },
        },
        blockedBy: {
          where: {
            nickname,
          },
        },
        blockedUsers: {
          where: {
            nickname,
          },
        },
        restrictedGroups: {
          where: {
            chatroomId,
            restriction: {
              in: [RESTRICTION.MUTED, RESTRICTION.KICKED],
            },
            restrictionTimeEnd: {
              gt: new Date(),
            },
          },
        },
        groupInvitation: {
          where: {
            chatroomId,
          },
        },
      },
    });

    if (!user) throw new WsUserNotFoundException();

    if (user.chatrooms.length > 0)
      throw new WsBadRequestException('User already in group');

    if (chatroom.type === TYPE.PRIVATE && user.groupInvitation.length > 0)
      throw new WsBadRequestException(
        'You already invited that user to your group',
      );

    if (user.blockedBy.length > 0) {
      throw new WsBadRequestException(
        "You cannot add a user you have blocked, weird isn't it ?",
      );
    }

    if (user.blockedUsers.length > 0) {
      throw new WsBadRequestException('That user blocked you, stop that!');
    }

    const groupParameter = user.groupParameter;

    if (groupParameter && !groupParameter.allowAll) {
      if (
        groupParameter.onlyAllowFriend &&
        user.friends.findIndex((friend) => friend.friendId === userId) === -1
      )
        throw new WsBadRequestException(
          'That user only allow friend of him to invite him in group',
        );
    }

    if (user.restrictedGroups.length > 0) {
      throw new WsUnauthorizedException(
        `That user has been ${
          user.restrictedGroups[0].restriction
        } until ${user.restrictedGroups[0].restrictionTimeEnd.toDateString()}`,
      );
    }

    const { id } = user;

    await this.prismaService.chatroom.update({
      where: { id: chatroomId },
      data: {
        invitedUser: {
          create: {
            userId: id,
          },
        },
      },
    });

    this.libService.sendToSocket(
      this.server,
      id,
      ChatEventGroup.RECEIVED_GROUP_INVITATION,
      {
        data: { id: chatroomId, chatroomName, type },
        message: `${adminNickname} invited you to join the group: ${chatroomName}`,
        severity: 'info',
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: `${nickname} succesfully invited`,
    });

    return;
  }

  @SubscribeMessage(ChatEventGroup.DECLINE_GROUP_INVITATION)
  async declineGroupInvitation(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() chatroomIdDto: ChatroomIdDto,
  ) {
    const { chatroomId } = chatroomIdDto;
    const { userId } = client;
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      select: {
        nickname: true,
        groupInvitation: {
          where: {
            chatroomId,
          },
        },
      },
    });

    if (!user) throw new WsUserNotFoundException();

    if (user.groupInvitation.length === 0) {
      throw new WsBadRequestException(
        'You did not receive invitation from that group',
      );
    }

    const chatroom = await this.prismaService.chatroom.update({
      where: { id: chatroomId },
      data: {
        invitedUser: {
          delete: {
            userId_chatroomId: {
              userId,
              chatroomId,
            },
          },
        },
      },
    });

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      data: { chatroomId },
      message: 'Invitation successfully declined',
    });

    this.libService.sendToSocket(
      this.server,
      chatroom.chatroomName,
      ChatEventGroup.USER_DECLINED_INVITATION,
      {
        data: { id: userId },
        message: `${user.nickname} declined group invitation`,
      },
    );
  }

  @SubscribeMessage(ChatEventGroup.CANCEL_USER_INVITATION)
  async cancelGroupInviation(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() chatroomIdWithUserIdDto: ChatroomIdWithUserIdDto,
  ) {
    const { chatroomId, id } = chatroomIdWithUserIdDto;
    const { userId } = client;
    const [, user] = await Promise.all([
      this.isDieriba(userId, chatroomId),
      this.prismaService.user.findFirst({
        where: { id },
        select: {
          nickname: true,
          groupInvitation: {
            where: {
              chatroomId,
            },
          },
        },
      }),
    ]);

    if (!user) throw new WsUserNotFoundException();

    if (user.groupInvitation.length === 0) {
      throw new WsBadRequestException(
        `${user.nickname} is not from that group`,
      );
    }

    await this.prismaService.chatroom.update({
      where: { id: chatroomId },
      data: {
        invitedUser: {
          delete: {
            userId_chatroomId: {
              userId: id,
              chatroomId,
            },
          },
        },
      },
    });

    this.libService.sendToSocket(
      this.server,
      id,
      ChatEventGroup.DELETE_USER_INVITATION,
      {
        data: { chatroomId },
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      data: { id },
      message: `User invitation for ${user.nickname} has been canceled!`,
    });
  }

  @SubscribeMessage(ChatEventGroup.ADD_FRIEND_USER)
  async addFriendUsersToChatroom(
    @MessageBody() chatRoomData: ChatroomDataDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { users, chatroomId } = chatRoomData;
    const { userId } = client;

    const [chatroom, adminNickname] = await Promise.all([
      this.prismaService.chatroom.findFirst({
        where: { id: chatroomId },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              chatroomId: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  profile: {
                    select: {
                      avatar: true,
                    },
                  },
                },
              },
              createdAt: true,
              content: true,
            },
          },
        },
      }),
      this.isDieriba(userId, chatroomId),
    ]);

    if (!chatroom) throw new WsNotFoundException('Chatroom does not exist');

    const { chatroomName, type, messages } = chatroom;

    const existingUserAndNonBlocked = await this.prismaService.user.findMany({
      where: {
        id: {
          in: users,
        },
        OR: [
          { friends: { some: { friendId: userId } } },
          { groupParameter: { allowAll: true } },
        ],
        chatrooms: {
          none: {
            chatroomId,
          },
        },
        blockedBy: {
          none: {
            id: userId,
          },
        },
        blockedUsers: {
          none: {
            id: userId,
          },
        },
        restrictedGroups: {
          none: {
            AND: [
              {
                chatroomId,
              },
              {
                restriction: {
                  in: [RESTRICTION.KICKED, RESTRICTION.BANNED],
                },
              },
              {
                restrictionTimeEnd: {
                  gt: new Date(),
                },
              },
            ],
          },
        },
      },
      select: {
        id: true,
        nickname: true,
        status: true,
        profile: {
          select: {
            avatar: true,
          },
        },
        friends: {
          select: {
            friendId: true,
          },
        },
      },
    });

    if (existingUserAndNonBlocked.length === 0) {
      this.libService.sendToSocket(
        this.server,
        userId,
        GeneralEvent.SUCCESS,
        {},
      );
      return;
    }

    existingUserAndNonBlocked.map(
      async ({ id, nickname, status, profile, friends }) => {
        await this.chatroomUserService.createNewChatroomUser(id, chatroomId);
        this.libService.sendToSocket(
          this.server,
          id,
          ChatEventGroup.NEW_CHATROOM,
          {
            message: `${nickname} added you in the group named ${chatroomName}`,
            data: {
              id: chatroomId,
              chatroomName,
              type,
              messages,
              restrictedUsers: [],
            },
          },
        );

        this.joinOrLeaveRoom(id, GeneralEvent.JOIN, chatroomName);

        this.libService.sendToSocket(
          this.server,
          chatroomName,
          ChatEventGroup.USER_ADDED,
          {
            data: {
              id,
              nickname,
              status,
              profile,
              friends,
            },
            message: `${adminNickname} added ${nickname}`,
          },
        );
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: 'User added successully!',
    });
  }

  @SubscribeMessage(ChatEventGroup.SET_DIERIBA)
  async setNewChatroomDieriba(
    @MessageBody() dieribaDto: DieribaDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { id, chatroomId } = dieribaDto;
    const { userId } = client;
    await this.isDieriba(userId, chatroomId);
    if (id === userId)
      throw new WsBadRequestException(
        'You already are the DIERIBA of that chatroom',
      );

    const [chatroomUser, restrictedUser] = await Promise.all([
      this.chatroomUserService.findChatroomUser(chatroomId, id),
      this.prismaService.restrictedUser.findUnique({
        where: {
          userId_chatroomId: {
            userId,
            chatroomId,
          },
          restrictionTimeEnd: { gt: new Date() },
        },
      }),
    ]);

    if (!chatroomUser)
      throw new WsUnknownException(
        'That user do not belong to that group or chatroom does not exist',
      );

    if (restrictedUser)
      throw new WsBadRequestException(
        "Can't set as DIERIBA someone that is currently on a restriction, please remove the restriction first",
      );

    if (chatroomUser.user.blockedUsers.length)
      throw new WsBadRequestException(
        "That user blocked you, hence you can't set him as Chat owner",
      );
    else if (chatroomUser.user.blockedBy.length)
      throw new WsBadRequestException(
        "You blocked that user, hence you can't set him as Chat owner",
      );

    const [, updateNewDieriba] = await this.prismaService.$transaction([
      this.prismaService.chatroomUser.update({
        where: { userId_chatroomId: { userId, chatroomId } },
        data: { role: ROLE.REGULAR_USER },
      }),
      this.prismaService.chatroomUser.update({
        where: { userId_chatroomId: { userId: id, chatroomId } },
        data: { role: ROLE.DIERIBA },
        select: {
          user: {
            select: {
              nickname: true,
            },
          },
        },
      }),
    ]);

    const {
      chatroom: { chatroomName },
    } = chatroomUser;

    this.libService.sendToSocket(
      client,
      chatroomName,
      ChatEventGroup.NEW_ADMIN,
      {
        message: `${updateNewDieriba.user.nickname} is now admin of that group!`,
        chatroomId,
        data: { id, role: chatroomUser.role },
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      data: { id, role: chatroomUser.role },
    });
  }

  @SubscribeMessage(ChatEventGroup.DELETE_GROUP_CHATROOM)
  async deleteChatroom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() chatroomIdDto: ChatroomIdDto,
  ) {
    const { chatroomId } = chatroomIdDto;
    const { userId } = client;

    const chatroomUser = await this.prismaService.chatroomUser.findUnique({
      where: {
        userId_chatroomId: {
          userId,
          chatroomId,
        },
      },
      select: {
        role: true,
        user: {
          select: {
            nickname: true,
          },
        },
      },
    });

    if (!chatroomUser) throw new WsUserNotFoundException();

    if (chatroomUser.role !== ROLE.DIERIBA)
      throw new WsUnauthorizedException(
        'Only admin of that room can delete it',
      );

    const chatroom = await this.prismaService.chatroom.delete({
      where: {
        id: chatroomId,
      },
      select: {
        chatroomName: true,
      },
    });

    const { chatroomName } = chatroom;

    this.libService.sendToSocket(
      client,
      chatroomName,
      ChatEventGroup.GROUP_CHATROOM_DELETED,
      {
        data: { chatroomId },
        message: `${chatroomUser.user.nickname} deleted the chatroom`,
        severity: 'info',
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      data: { chatroomId },
      message: 'chatroom deleted',
    });

    this.libService.deleteSocketRoom(this.server, chatroomName);
  }

  @SubscribeMessage(ChatEventGroup.KICK_USER)
  async kickUser(
    @MessageBody() deleteChatroomMember: ChatroomIdWithUserIdDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { userId } = client;
    const { id, chatroomId } = deleteChatroomMember;

    const clientNickname = await this.isDieriba(userId, chatroomId);

    if (id === userId)
      throw new WsBadRequestException(
        'Cannot delete the CHATROOM owner of that room',
      );

    const chatroomUser = await this.prismaService.chatroomUser.findUnique({
      where: {
        userId_chatroomId: {
          userId: id,
          chatroomId,
        },
      },
      select: {
        role: true,
        chatroom: {
          select: {
            chatroomName: true,
          },
        },
        user: {
          select: {
            nickname: true,
          },
        },
      },
    });

    if (!chatroomUser) {
      throw new WsNotFoundException('user is not in that group');
    }

    await this.prismaService.chatroomUser.delete({
      where: {
        userId_chatroomId: {
          userId: id,
          chatroomId,
        },
      },
    });
    const {
      chatroom: { chatroomName },
      user: { nickname },
    } = chatroomUser;

    this.joinOrLeaveRoom(id, GeneralEvent.LEAVE, chatroomName);

    this.libService.sendToSocket(
      client,
      chatroomName,
      ChatEventGroup.USER_KICKED,
      {
        data: { id, chatroomId, role: chatroomUser.role },
        chatroomId,
        message: `${clientNickname} has kicked ${nickname}`,
      },
    );

    this.libService.sendToSocket(this.server, id, ChatEventGroup.BEEN_KICKED, {
      message: `You have been kicked out of the group ${chatroomName}`,
      data: { chatroomId },
    });

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      data: { id, chatroomId, role: chatroomUser.role },
      message: `${nickname} has been kicked`,
    });
  }

  @SubscribeMessage(ChatEventGroup.LEAVE_GROUP)
  async leaveGroup(
    @MessageBody() chatroomIdDto: ChatroomIdDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { userId } = client;
    const { chatroomId } = chatroomIdDto;

    const chatroomUser = await this.prismaService.chatroomUser.findUnique({
      where: {
        userId_chatroomId: {
          userId,
          chatroomId,
        },
      },
      select: {
        chatroom: {
          select: {
            chatroomName: true,
          },
        },
        user: {
          select: {
            nickname: true,
          },
        },
        role: true,
      },
    });

    if (!chatroomUser) {
      throw new WsNotFoundException('You do no belong to that group');
    }

    if (chatroomUser.role === ROLE.DIERIBA) {
      await this.prismaService.$transaction(async (tx) => {
        const chatroom = await tx.chatroom.findFirst({
          where: {
            id: chatroomId,
          },
          select: {
            chatroomName: true,
            users: {
              select: {
                userId: true,
                user: {
                  select: {
                    nickname: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        });

        if (!chatroom) throw new WsChatroomNotFoundException();

        const { chatroomName } = chatroom;

        const newAdmin = chatroom.users.find((user) => user.userId !== userId);

        if (!newAdmin) {
          await tx.chatroom.delete({
            where: {
              id: chatroomId,
            },
          });
          this.libService.sendToSocket(
            this.server,
            userId,
            GeneralEvent.SUCCESS,
            {
              data: { chatroomId },
              message: `You leaved the group ${chatroomName}`,
            },
          );
          this.libService.sendToSocket(
            this.server,
            GeneralEvent.BROADCAST,
            ChatEventGroup.DELETE_JOINABLE_GROUP,
            {
              data: { chatroomId },
            },
          );
          this.libService.deleteSocketRoom(this.server, chatroomName);
          return;
        }
        const { role } = await tx.chatroomUser.update({
          where: {
            userId_chatroomId: {
              userId: newAdmin.userId,
              chatroomId,
            },
          },
          data: {
            role: ROLE.DIERIBA,
          },
        });
        await tx.chatroomUser.delete({
          where: {
            userId_chatroomId: {
              userId,
              chatroomId,
            },
          },
        });

        this.joinOrLeaveRoom(userId, GeneralEvent.LEAVE, chatroomName);

        this.libService.sendToSocket(
          this.server,
          chatroomName,
          ChatEventGroup.PREVIOUS_ADMIN_LEAVED,
          {
            data: {
              newAdminId: newAdmin.userId,
              newAdminPreviousRole: role,
            },
            chatroomId,
            message: `${chatroomUser.user.nickname} leaved the group and the new admin randomly choosen is now ${newAdmin.user.nickname}`,
          },
        );

        this.libService.sendToSocket(
          this.server,
          userId,
          GeneralEvent.SUCCESS,
          {
            data: { chatroomId },
            message: `You left the group ${chatroomName}`,
          },
        );
      });
      return;
    } else {
      await this.prismaService.chatroomUser.delete({
        where: {
          userId_chatroomId: {
            userId,
            chatroomId,
          },
        },
      });
    }

    const {
      chatroom: { chatroomName },
      user: { nickname },
    } = chatroomUser;

    this.joinOrLeaveRoom(userId, GeneralEvent.LEAVE, chatroomName);

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      data: { chatroomId },
      message: `chatroom ${chatroomName} leaved`,
    });

    this.libService.sendToSocket(
      client,
      chatroomName,
      ChatEventGroup.USER_LEAVED,
      {
        chatroomId,
        data: { id: userId, chatroomId, role: chatroomUser.role },
        message: `${nickname} has leaved the chatroom`,
      },
    );
  }

  @SubscribeMessage(ChatEventGroup.CHANGE_USER_ROLE)
  async changeUserRole(
    @MessageBody() changeUserRoleDto: ChangeUserRoleDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { id, role, chatroomId } = changeUserRoleDto;
    const { userId } = client;

    await this.isDieriba(userId, chatroomId);

    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      },
      select: {
        nickname: true,
        chatrooms: {
          where: {
            chatroomId,
          },
          select: {
            role: true,
            chatroom: {
              select: {
                chatroomName: true,
                restrictedUsers: {
                  where: {
                    userId: id,
                    restrictionTimeEnd: {
                      gt: new Date(),
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new WsUserNotFoundException();

    if (user.chatrooms.length === 0) throw new WsChatroomNotFoundException();

    const chatroomUser = user.chatrooms[0];

    if (chatroomUser.chatroom.restrictedUsers.length) {
      throw new WsUnauthorizedException(
        'Cannot change role of restricted user please unrestrict them first',
      );
    }

    if (chatroomUser.role === role) {
      throw new WsBadRequestException('User already have that role');
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.chatroomUser.update({
        where: {
          userId_chatroomId: {
            userId: id,
            chatroomId,
          },
        },
        data: {
          role,
        },
        select: {
          role: true,
          user: {
            select: {
              nickname: true,
            },
          },
        },
      });

      if (chatroomUser.role === ROLE.REGULAR_USER) {
        const isRestricted = await tx.restrictedUser.findUnique({
          where: {
            userId_chatroomId: {
              userId: id,
              chatroomId,
            },
          },
        });

        if (isRestricted) {
          await tx.restrictedUser.delete({
            where: {
              userId_chatroomId: {
                userId: id,
                chatroomId,
              },
            },
          });
        }
      }
    });

    const {
      chatroom: { chatroomName },
    } = chatroomUser;

    if (chatroomUser.role === ROLE.CHAT_ADMIN) {
      this.libService.sendToSocket(
        client,
        chatroomName,
        ChatEventGroup.USER_ROLE_CHANGED,
        {
          chatroomId,
          message: `${user.nickname} is no longer a chat moderator`,
          data: { id, role: chatroomUser.role },
        },
      );
    } else {
      this.libService.sendToSocket(
        client,
        chatroomName,
        ChatEventGroup.USER_ROLE_CHANGED,
        {
          chatroomId,
          message: `${user.nickname} is now a chat moderator`,
          data: { id, role: chatroomUser.role },
        },
      );
    }

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: `${user.nickname} is now a ${
        role === ROLE.CHAT_ADMIN ? 'moderator' : 'regular user'
      }`,
      data: { id, role: chatroomUser.role },
    });
  }

  @SubscribeMessage(ChatEventGroup.RESTRICT_USER)
  async restrictUser(
    @MessageBody() restrictedUserDto: RestrictedUsersDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { userId } = client;
    const [chatroomUser, userToRestrict] = await Promise.all([
      this.chatroomUserService.findChatroomUser(
        restrictedUserDto.chatroomId,
        userId,
      ),
      this.chatroomUserService.findChatroomUser(
        restrictedUserDto.chatroomId,
        restrictedUserDto.id,
      ),
    ]);

    restrictedUserDto.isChatAdmin =
      userToRestrict.role === ROLE.CHAT_ADMIN ? true : false;
    const { chatroomName } = chatroomUser.chatroom;
    const { nickname } = userToRestrict.user;
    const {
      chatroomId,
      id,
      duration,
      restriction,
      durationUnit,
      reason,
      isChatAdmin,
    } = restrictedUserDto;

    if (!chatroomUser)
      throw new WsNotFoundException(
        'You are not part of that group or that group does not exist',
      );

    if (
      chatroomUser.role !== ROLE.DIERIBA &&
      chatroomUser.role !== ROLE.CHAT_ADMIN
    ) {
      throw new WsUnauthorizedException(
        'You have no right to perform such action',
      );
    }

    if (!userToRestrict)
      throw new WsNotFoundException('User to restrict not found');

    if (userToRestrict.user.id === userId)
      throw new WsBadRequestException('Cannot restrict myself');

    if (
      chatroomUser.role !== ROLE.DIERIBA &&
      (userToRestrict.role === ROLE.DIERIBA ||
        userToRestrict.role === ROLE.CHAT_ADMIN)
    ) {
      throw new WsBadRequestException(
        'Cannot Restrict chat admin or DIERIBA as chat admin',
      );
    }

    const restrictionTimeStart = new Date();
    const restrictionTimeEnd = this.libService.getEndBanTime(
      durationUnit,
      restrictionTimeStart,
      duration,
    );

    await this.prismaService.$transaction(async (tx) => {
      const data = await tx.restrictedUser.upsert({
        where: {
          userId_chatroomId: {
            userId: id,
            chatroomId: chatroomId,
          },
        },
        update: {
          adminId: userId,
          restriction,
          restrictionTimeStart,
          restrictionTimeEnd,
          banLife: duration === Number.MAX_SAFE_INTEGER,
          reason,
        },
        create: {
          adminId: userId,
          userId: id,
          chatroomId,
          restriction,
          restrictionTimeStart,
          restrictionTimeEnd,
          banLife: duration === Number.MAX_SAFE_INTEGER,
          reason,
        },
        select: {
          user: {
            select: {
              id: true,
              nickname: true,
              status: true,
              profile: {
                select: {
                  avatar: true,
                },
              },
            },
          },
          admin: {
            select: {
              user: {
                select: {
                  nickname: true,
                },
              },
              role: true,
            },
          },
        },
      });

      if (duration === Number.MAX_SAFE_INTEGER) {
        await tx.chatroomUser.delete({
          where: {
            userId_chatroomId: {
              userId: id,
              chatroomId,
            },
          },
        });
      } else if (isChatAdmin) {
        await tx.chatroomUser.update({
          where: {
            userId_chatroomId: {
              userId: id,
              chatroomId,
            },
          },
          data: {
            role: ROLE.REGULAR_USER,
          },
        });
      }

      const { user, admin } = data;

      if (
        duration === Number.MAX_SAFE_INTEGER ||
        restriction === RESTRICTION.KICKED ||
        restriction === RESTRICTION.BANNED
      ) {
        this.joinOrLeaveRoom(id, GeneralEvent.LEAVE, chatroomName);
      }

      this.libService.sendToSocket(
        this.server,
        id,
        ChatEventGroup.USER_BANNED_MUTED_KICKED_RESTRICTION,
        {
          data: {
            chatroomId,
            reason,
            restrictionTimeEnd,
            restriction,
            admin,
            banLife: duration === Number.MAX_SAFE_INTEGER,
          },
        },
      );

      this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
        data: {
          role: isChatAdmin ? ROLE.CHAT_ADMIN : ROLE.REGULAR_USER,
          user: {
            ...user,
            restrictedGroups: [
              {
                admin,
                reason,
                restrictionTimeEnd,
                restriction,
              },
            ],
          },
        },
        message: `${nickname} has sucessfully been ${restriction} for ${
          duration === Number.MAX_SAFE_INTEGER
            ? 'life'
            : `${duration} ${durationUnit}`
        }`,
      });

      this.libService.sendToSocket(
        client,
        chatroomName,
        ChatEventGroup.USER_RESTRICTED,
        {
          data: {
            role: isChatAdmin ? ROLE.CHAT_ADMIN : ROLE.REGULAR_USER,
            user: {
              ...user,
              restrictedGroups: [
                {
                  admin,
                  reason,
                  restrictionTimeEnd,
                  restriction,
                },
              ],
            },
          },
          chatroomId,
          message: `${nickname} has been ${restriction} for ${
            duration === Number.MAX_SAFE_INTEGER
              ? 'life'
              : `${duration} ${durationUnit}`
          } by ${chatroomUser.user.nickname}`,
        },
      );
    });
  }

  @SubscribeMessage(ChatEventGroup.UNRESTRICT_USER)
  async unrestrictUser(
    @MessageBody()
    unrestrictedUserDto: UnrestrictedUsersDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { userId } = client;
    const { isChatAdmin, chatroomId, id } = unrestrictedUserDto;

    const [chatroomUser, restrictedUser] = await Promise.all([
      this.chatroomUserService.findChatroomUser(chatroomId, userId),
      this.prismaService.restrictedUser.findUnique({
        where: {
          userId_chatroomId: {
            userId: id,
            chatroomId: chatroomId,
          },
        },
        select: {
          chatroom: { select: { chatroomName: true } },
          adminId: true,
          restrictionTimeEnd: true,
          banLife: true,
          user: {
            select: {
              id: true,
              nickname: true,
              status: true,
              profile: {
                select: {
                  avatar: true,
                  lastname: true,
                  firstname: true,
                },
              },
              friends: {
                select: {
                  friendId: true,
                },
              },
            },
          },
          restriction: true,
        },
      }),
    ]);

    unrestrictedUserDto.isChatAdmin =
      chatroomUser.role === ROLE.CHAT_ADMIN ? true : false;

    if (!chatroomUser)
      throw new WsNotFoundException(
        'You are not part of that group or that group does not exist',
      );

    if (
      chatroomUser.role !== ROLE.DIERIBA &&
      chatroomUser.role !== ROLE.CHAT_ADMIN
    ) {
      throw new WsUnauthorizedException(
        'You have no right to perform such action',
      );
    }
    if (!restrictedUser)
      throw new WsUnknownException(`The user is not restricted`);

    if (isChatAdmin && userId !== restrictedUser.adminId) {
      throw new WsUnauthorizedException(
        'Only Admin or moderator who restricted that user can unrestrict him',
      );
    }

    if (restrictedUser.banLife && chatroomUser.role !== ROLE.DIERIBA)
      throw new WsUnauthorizedException('Only Admin can undo that restriction');

    const {
      chatroom: { chatroomName },
      user,
      restriction,
    } = restrictedUser;

    const message = await this.prismaService.message.findMany({
      where: {
        chatroomId,
        user: {
          blockedBy: {
            none: {
              id,
            },
          },
          blockedUsers: {
            none: {
              id,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
      select: {
        id: true,
        content: true,
        user: {
          select: {
            id: true,
            nickname: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        createdAt: true,
        chatroomId: true,
      },
    });

    await this.prismaService.restrictedUser.delete({
      where: {
        userId_chatroomId: {
          userId: id,
          chatroomId,
        },
      },
    });

    this.libService.sendToSocket(
      this.server,
      id,
      ChatEventGroup.USER_UNBANNED_UNKICKED_UNMUTED,
      {
        data: { message, chatroomId, restriction },
      },
    );

    if (restriction !== RESTRICTION.MUTED) {
      this.joinOrLeaveRoom(id, GeneralEvent.JOIN, chatroomName);
    }

    this.libService.sendToSocket(
      client,
      chatroomName,
      ChatEventGroup.USER_UNRESTRICTED,
      {
        data: {
          user: {
            ...user,
            banLife: restrictedUser.banLife,
            chatroomId,
          },
        },
      },
    );

    this.libService.sendToSocket(
      this.server,
      client.userId,
      GeneralEvent.SUCCESS,
      {
        data: {
          ...user,
          banLife: restrictedUser.banLife,
        },
        message: `${user.nickname} is no longer ${restriction}`,
      },
    );
  }

  @SubscribeMessage(ChatEventGroup.REQUEST_ALL_CHATROOM)
  async getUserGroupChatroom(@ConnectedSocket() client: SocketWithAuth) {
    const { userId } = client;
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        blockedUsers: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            groupInvitation: true,
          },
        },
      },
    });

    if (!user) throw new WsUserNotFoundException();

    const chatrooms = await this.prismaService.chatroom.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
        active: true,
        type: {
          not: TYPE.DM,
        },
        restrictedUsers: {
          none: {
            userId,
            restrictionTimeEnd: {
              gt: new Date(),
            },
            restriction: {
              in: [RESTRICTION.KICKED, RESTRICTION.BANNED],
            },
          },
        },
      },
      select: {
        id: true,
        chatroomName: true,
        type: true,
        messages: {
          where: {
            user: {
              blockedBy: {
                none: {
                  id: userId,
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            chatroomId: true,
            user: {
              select: {
                id: true,
                nickname: true,
                profile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
            createdAt: true,
            content: true,
          },
        },
        restrictedUsers: {
          where: {
            userId,
            restrictionTimeEnd: {
              gt: new Date(),
            },
          },
          select: {
            restriction: true,
            restrictionTimeEnd: true,
            admin: { select: { user: { select: { nickname: true } } } },
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    chatrooms.map((chatroom) => {
      if (
        chatroom.restrictedUsers.length == 0 ||
        chatroom.restrictedUsers[0].restriction === RESTRICTION.MUTED
      ) {
        client.join(chatroom.chatroomName);
      }
    });

    this.libService.sendToSocket(
      this.server,
      userId,
      ChatEventGroup.GET_ALL_CHATROOM,
      {
        data: {
          chatrooms,
          blockedUser: user.blockedUsers,
          numberOfGroupInvitation: user._count.groupInvitation,
        },
      },
    );
  }

  @SubscribeMessage(ChatEventGroup.REQUEST_ALL_CHATROOM_MESSAGE)
  @UseGuards(IsRestrictedUserGuardWs)
  async getGroupChatroomMessage(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('chatroomId') chatroomId: string,
  ) {
    const { userId } = client;
    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
        users: {
          some: {
            userId,
          },
        },
      },
      select: {
        chatroomName: true,
        messages: {
          where: {
            user: {
              blockedUsers: {
                none: {
                  id: userId,
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                nickname: true,
                profile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
            chatroomId: true,
            createdAt: true,
          },
        },
      },
    });

    this.libService.sendToSocket(
      this.server,
      client.userId,
      ChatEventGroup.GET_ALL_CHATROOM_MESSAGE,
      {
        data: chatroom.messages,
      },
    );

    if (
      !this.server
        .of('/')
        .adapter.rooms.get(chatroom.chatroomName)
        ?.has(client.userId)
    )
      client.join(chatroom.chatroomName);
  }

  @SubscribeMessage(ChatEventGroup.JOIN_CHATROOM)
  @UseGuards(IsRestrictedUserGuardWs)
  async joinChatroom(
    @MessageBody() joinChatroomDto: JoinChatroomDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { chatroomId } = joinChatroomDto;
    const { userId } = client;

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
      },
      select: {
        id: true,
        chatroomName: true,
        password: true,
        type: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            chatroomId: true,
            user: {
              select: {
                id: true,
                nickname: true,
                profile: {
                  select: {
                    avatar: true,
                    lastname: true,
                    firstname: true,
                  },
                },
              },
            },
            createdAt: true,
            content: true,
          },
        },
        invitedUser: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    if (!chatroom) throw new WsChatroomNotFoundException();

    const foundChatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    if (foundChatroomUser)
      throw new WsBadRequestException('You already belong to that group');

    const { password, ...data } = chatroom;

    if (chatroom.invitedUser.length === 0) {
      if (chatroom.type === TYPE.PRIVATE) {
        throw new WsUnauthorizedException(
          "You can't join that private chatroom, you need to be invited first",
        );
      } else if (chatroom.type === TYPE.PROTECTED) {
        if (!joinChatroomDto.password)
          throw new WsBadRequestException(
            'Password is needed for protected room',
          );

        const match = await this.argon2Service.compare(
          password,
          joinChatroomDto.password,
        );

        if (!match)
          throw new WsUnauthorizedException(
            "Wrong password, you can't acces that chatroom",
          );
      }
    }
    let userInfo = await this.chatroomUserService.createNewChatroomUser(
      userId,
      chatroomId,
    );

    if (chatroom.invitedUser.length) {
      await this.prismaService.$transaction(async (tx) => {
        userInfo = await this.chatroomUserService.createNewChatroomUserTx(
          tx,
          userId,
          chatroomId,
        );
        await tx.chatroom.update({
          where: {
            id: chatroomId,
          },
          data: {
            invitedUser: {
              delete: {
                userId_chatroomId: {
                  userId,
                  chatroomId,
                },
              },
            },
          },
        });
      });
    }
    const { user } = userInfo;

    this.libService.sendToSocket(
      this.server,
      chatroom.chatroomName,
      ChatEventGroup.NEW_USER_CHATROOM,
      {
        message: `${user.nickname} has joined the group`,
        chatroomId,
        data: {
          ...user,
        },
      },
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: `Succesfully joined the group: ${chatroom.chatroomName}`,
      data,
    });

    this.joinOrLeaveRoom(userId, GeneralEvent.JOIN, chatroom.chatroomName);
  }

  @SubscribeMessage(ChatEventGroup.SEND_GROUP_MESSAGE)
  @ChatRoute()
  @UseGuards(IsRestrictedUserGuardWs)
  async sendMessageToChatroom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() chatroomMessageDto: ChatroomMessageDto,
  ) {
    const { userId } = client;
    const { chatroomId, content } = chatroomMessageDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        nickname: true,
      },
    });

    if (!user) throw new WsUserNotFoundException();

    const chatroom = await this.chatroomService.findChatroom(
      chatroomId,
      ChatroomBaseData,
    );

    if (!chatroom) throw new WsChatroomNotFoundException();

    const res = await this.prismaService.message.create({
      data: {
        content: content,
        user: {
          connect: {
            id: userId,
          },
        },
        chatroom: {
          connect: {
            id: chatroomId,
          },
        },
      },
      select: {
        id: true,
        content: true,
        chatroomId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });

    this.libService.sendToSocket(
      this.server,
      chatroom.chatroomName,
      ChatEventGroup.RECEIVE_GROUP_MESSAGE,
      {
        data: {
          id: res.id,
          content,
          chatroomId,
          createdAt: res.createdAt,
          user: {
            id: userId,
            nickname: user.nickname,
            profile: {
              avatar: res.user.profile?.avatar,
            },
          },
        },
      },
    );
  }

  @SubscribeMessage(ChatEventPrivateRoom.SEND_PRIVATE_MESSAGE)
  async sendDmToPenfriend(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() message: DmMessageDto,
  ) {
    const { friendId, content, chatroomId } = message;
    const { userId } = client;

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        blockedBy: {
          where: {
            id: friendId,
          },
        },
        blockedUsers: { where: { id: friendId } },
      },
    });

    if (!user) throw new WsUserNotFoundException();

    if (user.blockedBy.length > 0) {
      throw new WsUnauthorizedException('Cannot dm a user that blocked you');
    }

    if (user.blockedUsers.length > 0) {
      throw new WsUnauthorizedException('Cannot dm a user that you blocked');
    }

    const chatroom = await this.chatroomService.findChatroom(
      chatroomId,
      ChatroomBaseData,
    );

    if (!chatroom) {
      throw new WsChatroomNotFoundException();
    }

    const res = await this.prismaService.message.create({
      data: {
        content: content,
        user: {
          connect: {
            id: userId,
          },
        },
        chatroom: {
          connect: {
            id: chatroomId,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });

    this.libService.sendSameEventToSockets(
      this.server,
      ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE,
      [
        {
          room: friendId,
          object: {
            data: {
              id: res.id,
              chatroomId,
              content,
              user: res.user,
              createdAt: res.createdAt,
            },
          },
        },
        {
          room: userId,
          object: {
            data: {
              id: res.id,
              chatroomId,
              content,
              user: res.user,
              createdAt: res.createdAt,
            },
          },
        },
      ],
    );
  }

  private async isDieriba(userId: string, chatroomId: string): Promise<string> {
    const chatroomUser = await this.prismaService.chatroomUser.findUnique({
      where: {
        userId_chatroomId: {
          chatroomId,
          userId,
        },
      },
      include: {
        chatroom: true,
        user: true,
      },
    });

    if (!chatroomUser)
      throw new WsNotFoundException(
        'The chatroom does not exists or User is not part of it',
      );

    if (chatroomUser.role !== ROLE.DIERIBA)
      throw new WsUnauthorizedException(
        `You have no right to perform the requested action in the groupe named ${chatroomUser.chatroom.chatroomName}`,
      );

    return chatroomUser.user.nickname;
  }

  /*------------------------------------------------------------------------------------------------------ */
  @SubscribeMessage(FriendEvent.REQUEST_SENT)
  async sendFriendRequest(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() body: FriendsTypeNicknameDto,
  ) {
    const { nickname } = body;
    const { userId } = client;
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new WsUserNotFoundException();

    const friend = await this.userService.findUserByNickName(
      nickname,
      UserData,
    );

    if (!friend) throw new WsUserNotFoundException();

    if (friend.nickname === user.nickname)
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

    this.libService.sendToSocket(
      this.server,
      friendId,
      FriendEvent.NEW_REQUEST_RECEIVED,
      {
        message: `You received a friend request from ${user.nickname}`,
        data: {
          friendId: client.userId,
        },
      },
    );

    this.libService.sendToSocket(
      this.server,
      friendId,
      FriendEvent.ADD_NEW_REQUEST,
      {
        message: `You received a friend request from ${user.nickname}`,
        data: {
          createdAt: request.createdAt,
          sender: {
            nickname: user.nickname,
            id: client.userId,
            profile: { avatar: user.profile?.avatar },
          },
        },
      },
    );

    this.libService.sendToSocket(
      this.server,
      client.userId,
      FriendEvent.NEW_REQUEST_SENT,
      {
        data: {
          recipient: {
            nickname: friend.nickname,
            id: friend.id,
            profile: { avatar: friend.profile?.avatar },
          },
        },
      },
    );

    this.libService.sendToSocket(
      this.server,
      client.userId,
      GeneralEvent.SUCCESS,
      {
        message: 'Friend request succesfully sent',
      },
    );
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

    this.libService.sendSameEventToSockets(
      this.server,
      FriendEvent.CANCEL_REQUEST,
      [
        {
          room: userId,
          object: {
            data: { friendId },
            message: 'Friend request declined succesfully',
          },
        },
        { room: friendId, object: { data: { friendId: userId } } },
      ],
    );

    this.libService.sendToSocket(
      this.server,
      client.userId,
      GeneralEvent.SUCCESS,
      {
        message: 'Friend request declined succesfully',
      },
    );
  }

  @SubscribeMessage(FriendEvent.REQUEST_ACCEPTED)
  async acceptFriend(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const { userId } = client;

    const [me, user] = await Promise.all([
      this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          chatrooms: {
            where: {
              chatroom: {
                type: TYPE.DM,
                users: {
                  some: {
                    userId: friendId,
                  },
                },
              },
            },
          },
          friends: {
            where: {
              friendId,
            },
          },
          friendRequestsSent: {
            where: {
              recipientId: friendId,
            },
            select: {
              sender: {
                include: { profile: true },
              },
              recipient: {
                include: { profile: true },
              },
              senderId: true,
              recipientId: true,
            },
          },
          friendRequestsReceived: {
            where: {
              senderId: friendId,
            },
            select: {
              sender: {
                include: { profile: true },
              },
              recipient: {
                include: { profile: true },
              },
              senderId: true,
              recipientId: true,
            },
          },
        },
      }),
      this.prismaService.user.findUnique({ where: { id: friendId } }),
    ]);

    if (!me || !user) throw new WsUserNotFoundException();

    const { friends, friendRequestsReceived, friendRequestsSent, chatrooms } =
      me;

    if (friends.length > 0)
      throw new WsBadRequestException('You are already friends with that user');

    if (friendRequestsReceived.length === 0)
      throw new WsBadRequestException('User has not send you a friend request');

    const existingFriendRequest =
      friendRequestsReceived.length > 0
        ? friendRequestsReceived
        : friendRequestsSent;

    const { sender, recipient, senderId, recipientId } =
      existingFriendRequest[0];
    await this.prismaService.$transaction(async (tx) => {
      await tx.friendRequest.delete({
        where: {
          senderId_recipientId: {
            senderId,
            recipientId,
          },
        },
      });

      await tx.friends.create({
        data: {
          user: { connect: { id: userId } },
          friend: { connect: { id: friendId } },
        },
      });
      await tx.friends.create({
        data: {
          user: { connect: { id: friendId } },
          friend: { connect: { id: userId } },
        },
      });

      const chatroom = await tx.chatroom.upsert({
        where: {
          id: chatrooms.length > 0 ? chatrooms[0].chatroomId : '',
          type: TYPE.DM,
          users: {
            every: {
              userId: {
                in: [senderId, recipientId],
              },
            },
          },
        },
        create: {
          type: TYPE.DM,
          users: {
            create: [{ userId: userId }, { userId: friendId }],
          },
        },
        update: { active: true },
        select: {
          id: true,
          users: {
            select: {
              user: {
                select: {
                  id: true,
                  pong: true,
                  nickname: true,
                  status: true,
                  profile: {
                    select: {
                      avatar: true,
                      lastname: true,
                      firstname: true,
                    },
                  },
                  friends: {
                    where: {
                      friendId: userId,
                    },
                    select: {
                      friendId: true,
                    },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              chatroomId: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  profile: { select: { avatar: true } },
                },
              },
              content: true,
              createdAt: true,
            },
            take: 1,
          },
        },
      });

      this.libService.sendSameEventToSockets(
        this.server,
        FriendEvent.CANCEL_REQUEST,
        [
          { room: friendId, object: { data: { friendId: userId } } },
          { room: userId, object: { data: { friendId } } },
        ],
      );

      this.libService.sendToSocket(
        this.server,
        friendId,
        FriendEvent.NEW_REQUEST_ACCEPTED,
        {
          message: `${recipient.nickname} accepted your friend request`,
          data: { friendId: client.userId },
        },
      );

      this.libService.sendToSocket(
        this.server,
        userId,
        FriendEvent.REQUEST_ACCEPTED_FROM_RECIPIENT,
        {
          message: `You are now friend with ${
            friendId === sender.id ? sender.nickname : recipient.nickname
          }`,
          data: { friendId },
        },
      );

      this.libService.sendSameEventToSockets(
        this.server,
        FriendEvent.NEW_FRIEND,
        [
          {
            room: friendId,
            object: {
              data: {
                friend: {
                  id: sender.id === friendId ? recipient.id : friendId,
                  nickname:
                    sender.id === friendId
                      ? recipient.nickname
                      : sender.nickname,
                  profile: {
                    avatar:
                      sender.id === friendId
                        ? recipient.profile.avatar
                        : sender.profile.avatar,
                  },
                  status:
                    sender.id === client.userId
                      ? sender.status
                      : recipient.status,
                },
              },
            },
          },
          {
            room: userId,
            object: {
              data: {
                friend: {
                  id: sender.id === client.userId ? recipient.id : friendId,
                  nickname:
                    sender.id === client.userId
                      ? recipient.nickname
                      : sender.nickname,
                  profile: {
                    avatar:
                      sender.id === client.userId
                        ? recipient.profile.avatar
                        : sender.profile.avatar,
                  },
                  status:
                    sender.id === client.userId
                      ? sender.status
                      : recipient.status,
                },
              },
            },
          },
        ],
      );

      const firstArrUser = userId === chatroom.users[0].user.id;
      const secondArrUser = !firstArrUser;

      this.libService.sendSameEventToSockets(
        this.server,
        ChatEventPrivateRoom.NEW_CHATROOM,
        [
          {
            room: friendId,
            object: {
              data: {
                ...chatroom,
                users: [secondArrUser ? chatroom.users[1] : chatroom.users[0]],
              },
            },
          },
          {
            room: userId,
            object: {
              data: {
                ...chatroom,
                users: [firstArrUser ? chatroom.users[1] : chatroom.users[0]],
              },
            },
          },
        ],
      );
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
    await this.prismaService.$transaction(async (tx) => {
      await tx.friends.delete({
        where: {
          userId_friendId: { userId, friendId },
        },
      });
      await tx.friends.delete({
        where: {
          userId_friendId: { userId: friendId, friendId: userId },
        },
      });

      const chatroom = await tx.chatroom.findFirst({
        where: {
          type: TYPE.DM,
          AND: [
            { users: { some: { userId } } },
            { users: { some: { userId: friendId } } },
          ],
        },
      });
      if (chatroom) {
        await tx.chatroom.update({
          where: { id: chatroom.id },
          data: { active: false },
        });
      }
    });

    this.libService.sendSameEventToSockets(
      this.server,
      FriendEvent.DELETE_FRIEND,
      [
        { room: friendId, object: { data: { friendId: userId } } },
        {
          room: userId,
          object: { data: { friendId }, message: 'Friend deleted!' },
        },
      ],
    );
    this.libService.sendToSocket(
      this.server,
      client.userId,
      GeneralEvent.SUCCESS,
    );
  }

  @SubscribeMessage(FriendEvent.BLOCK_FRIEND)
  async blockUser(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const { userId } = client;

    const [me, user] = await Promise.all([
      this.prismaService.user.findFirst({
        where: { id: userId },
        select: {
          blockedUsers: {
            where: {
              id: friendId,
            },
          },
          friends: {
            where: {
              friendId,
            },
          },
          friendRequestsReceived: {
            where: {
              senderId: friendId,
            },
            select: {
              senderId: true,
              recipientId: true,
            },
          },
          friendRequestsSent: {
            where: {
              recipientId: friendId,
            },
            select: {
              senderId: true,
              recipientId: true,
            },
          },
        },
      }),
      this.prismaService.user.findFirst({
        where: { id: friendId },
        select: {
          id: true,
          nickname: true,
          profile: { select: { avatar: true } },
        },
      }),
    ]);

    if (!me || !user) throw new WsUserNotFoundException();

    const {
      blockedUsers,
      friends,
      friendRequestsReceived,
      friendRequestsSent,
    } = me;

    if (blockedUsers.length > 0)
      throw new WsBadRequestException('User already blocked');

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        type: TYPE.DM,
        users: {
          every: {
            userId: {
              in: [userId, friendId],
            },
          },
        },
      },
    });

    const existingFriendRequest =
      friendRequestsReceived.length > 0
        ? friendRequestsReceived
        : friendRequestsSent;

    await this.prismaService.$transaction(async (tx) => {
      if (chatroom) {
        await tx.chatroom.update({
          where: { id: chatroom.id },
          data: { active: false },
        });
      }
      if (friends.length > 0) {
        await tx.friends.delete({
          where: {
            userId_friendId: {
              userId,
              friendId,
            },
          },
        });

        await tx.friends.delete({
          where: {
            userId_friendId: {
              userId: friendId,
              friendId: userId,
            },
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: friendId } } },
        });

        this.libService.sendSameEventToSockets(
          this.server,
          FriendEvent.DELETE_FRIEND,
          [
            {
              room: userId,
              object: {
                data: { friendId, message: `${user.nickname} blocked!` },
              },
            },
            {
              room: friendId,
              object: {
                data: { friendId: userId },
              },
            },
          ],
        );

        return;
      }
      if (existingFriendRequest.length > 0) {
        await tx.friendRequest.delete({
          where: {
            senderId_recipientId: {
              senderId: existingFriendRequest[0].senderId,
              recipientId: existingFriendRequest[0].recipientId,
            },
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: friendId } } },
        });

        this.libService.sendSameEventToSockets(
          this.server,
          FriendEvent.CANCEL_REQUEST,
          [
            {
              room: userId,
              object: {
                data: { friendId },
              },
            },
            {
              room: friendId,
              object: {
                data: { friendId: userId },
              },
            },
          ],
        );
      } else {
        await this.prismaService.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: friendId } } },
        });
      }
      this.libService.sendSameEventToSockets(
        this.server,
        ChatEventPrivateRoom.CLEAR_CHATROOM,
        [
          {
            room: userId,
            object: {
              data: { chatroomId: chatroom.id },
              message: `${user.nickname} blocked!`,
            },
          },
          { room: friendId, object: { data: { chatroomId: chatroom.id } } },
        ],
      );
    });

    this.libService.sendToSocket(
      this.server,
      client.userId,
      GeneralEvent.NEW_BLOCKED_USER,
      { data: user },
    );

    this.libService.sendToSocket(
      this.server,
      client.userId,
      GeneralEvent.SUCCESS,
      { message: 'User blocked succesfully' },
    );
  }

  @SubscribeMessage(FriendEvent.UNBLOCK_FRIEND)
  async unblockUser(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsFriendExistWs) body: FriendsTypeDto,
  ) {
    const { friendId } = body;
    const { userId } = client;

    const [me, user] = await Promise.all([
      this.prismaService.user.findUnique({
        where: { id: userId },
        select: { blockedUsers: { where: { id: friendId } } },
      }),
      this.prismaService.user.findFirst({
        where: { id: friendId },
        select: {
          id: true,
          nickname: true,
          profile: { select: { avatar: true } },
        },
      }),
    ]);

    if (!me || !user) throw new WsUserNotFoundException();

    const { blockedUsers } = me;

    if (blockedUsers.length > 0) {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { blockedUsers: { disconnect: { id: friendId } } },
      });
      const { id, nickname, profile } = user;

      this.libService.sendToSocket(
        this.server,
        client.userId,
        GeneralEvent.REMOVE_BLOCKED_USER,
        {
          data: { id, nickname, profile },
        },
      );
    }
    this.libService.sendToSocket(
      this.server,
      client.userId,
      GeneralEvent.SUCCESS,
      { message: 'User Unblocked' },
    );
  }

  @SubscribeMessage(ChatEventPrivateRoom.CREATE_PRIVATE_CHATROOM)
  async createNewPrivateChatroom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { id }: UserIdDto,
  ) {
    const { userId } = client;
    const [me, user, chatroom] = await Promise.all([
      this.prismaService.user.findFirst({
        where: { id: userId },
        include: {
          blockedBy: { where: { id } },
          blockedUsers: { where: { id } },
        },
      }),
      this.prismaService.user.findFirst({ where: { id } }),
      this.prismaService.chatroom.findFirst({
        where: {
          type: TYPE.DM,
          users: { every: { userId: { in: [userId, id] } } },
        },
        select: {
          id: true,
          active: true,
          users: {
            select: {
              user: {
                select: {
                  id: true,
                  pong: true,
                  nickname: true,
                  status: true,
                  profile: {
                    select: {
                      avatar: true,
                      lastname: true,
                      firstname: true,
                    },
                  },
                  friends: {
                    where: {
                      friendId: userId,
                    },
                    select: {
                      friendId: true,
                    },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              chatroomId: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  profile: { select: { avatar: true } },
                },
              },
              content: true,
              createdAt: true,
            },
            take: 1,
          },
        },
      }),
    ]);

    if (!me || !user) throw new WsUserNotFoundException();

    if (me.blockedUsers.length > 0) {
      throw new WsUnauthorizedException(
        "You can't create a conversation with user, you blocked",
      );
    }

    if (me.blockedBy.length > 0) {
      throw new WsBadRequestException(
        "You can't create a conversation with user that blocked you",
      );
    }

    const { active, ...data } = chatroom;
    if (chatroom) {
      if (!active) {
        await this.prismaService.chatroom.update({
          where: { id: chatroom.id },
          data: { active: true },
        });
      }

      const firstArrUser = userId === chatroom.users[0].user.id;
      const secondArrUser = !firstArrUser;

      this.libService.sendSameEventToSockets(
        this.server,
        ChatEventPrivateRoom.NEW_CHATROOM,
        [
          {
            client,
            room: userId,
            object: {
              data: {
                ...data,
                users: [firstArrUser ? chatroom.users[1] : chatroom.users[0]],
              },
            },
          },
          {
            room: id,
            object: {
              data: {
                ...data,
                users: [secondArrUser ? chatroom.users[1] : chatroom.users[0]],
              },
            },
          },
        ],
      );

      this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
        data: {
          ...data,
          users: [firstArrUser ? chatroom.users[1] : chatroom.users[0]],
        },
      });

      return;
    }

    const newChatroom = await this.prismaService.chatroom.create({
      data: {
        type: TYPE.DM,
        users: {
          create: [{ userId }, { userId: id }],
        },
      },
      select: {
        id: true,
        active: true,
        users: {
          select: {
            user: {
              select: {
                id: true,
                pong: true,
                nickname: true,
                status: true,
                profile: {
                  select: {
                    avatar: true,
                    lastname: true,
                    firstname: true,
                  },
                },
                friends: {
                  where: {
                    friendId: userId,
                  },
                  select: {
                    friendId: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            chatroomId: true,
            user: {
              select: {
                id: true,
                nickname: true,
                profile: { select: { avatar: true } },
              },
            },
            content: true,
            createdAt: true,
          },
          take: 1,
        },
      },
    });

    const firstArrUser = userId === newChatroom.users[0].user.id;
    const secondArrUser = !firstArrUser;

    this.libService.sendSameEventToSockets(
      this.server,
      ChatEventPrivateRoom.NEW_CHATROOM,
      [
        {
          client,
          room: userId,
          object: {
            data: {
              ...newChatroom,
              users: [
                firstArrUser ? newChatroom.users[1] : newChatroom.users[0],
              ],
            },
          },
        },
        {
          room: id,
          object: {
            data: {
              ...newChatroom,
              users: [
                secondArrUser ? newChatroom.users[1] : newChatroom.users[0],
              ],
            },
          },
        },
      ],
    );

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      data: {
        ...newChatroom,
        users: [firstArrUser ? newChatroom.users[1] : newChatroom.users[0]],
      },
    });
  }
  /*------------------------------------------------------------------------------------------------------ */
  @Interval(FRAME_RATE)
  async updateGame() {
    this.pongService.gameUpdate(this.server);
  }

  @SubscribeMessage(PongEvent.JOIN_QUEUE)
  async joinQueue(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { pongType }: PongGameTypeDto,
  ) {
    const { userId } = client;

    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) throw new WsUserNotFoundException();
    const inARoom = this.pongService.checkIfUserIsAlreadyInARoom(userId);

    if (inARoom) {
      throw new WsBadRequestException(
        'You are already in a room, please leave it before rejoining the queue',
      );
    }

    if (this.pongService.hasActiveInvitation(userId))
      throw new WsUnauthorizedException(
        'You must undo invitation before joining queue',
      );

    const data = await this.pongService.checkIfMatchupIsPossible(
      userId,
      client.id,
      pongType,
    );

    if (data) {
      const { room, creator } = data;

      if (creator === undefined) throw new WsUserNotFoundException();

      const senderSocket = this.libService.getSocket(
        this.server,
        creator.socketId,
      );

      if (!senderSocket) {
        this.pongService.deleteGameRoomByGameId(room);
        throw new WsUnknownException(
          `${user.nickname} is currently not online`,
        );
      }

      await this.pongService.joinGame(
        this.server,
        room,
        {
          creator: creator,
          opponent: {
            nickname: user.nickname,
            avatar: user.profile.avatar,
          },
        },
        userId,
        creator.id,
        client,
        senderSocket as SocketWithAuth,
      );
      return;
    }

    this.pongService.createGameRoom(userId, client.id, pongType);

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: 'Please wait for an opponent...',
    });
  }

  @SubscribeMessage(PongEvent.LEAVE_QUEUE)
  async leaveQueue(@ConnectedSocket() client: SocketWithAuth) {
    const { userId } = client;

    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new WsUserNotFoundException();

    const game = this.pongService.checkIfUserIsAlreadyInARoom(userId);

    if (game) {
      this.pongService.deleteGameRoomByGameId(game.getGameId);
    }
    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS);
  }

  @SubscribeMessage(PongEvent.SEND_GAME_INVITATION)
  async sendGameInvtation(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { id, pongType }: GameInvitationDto,
  ) {
    const { userId } = client;

    if (userId === id)
      throw new WsUnauthorizedException(
        'You cannot send an invitation to yourself!',
      );

    const [me, user] = await Promise.all([
      this.prismaService.user.findFirst({
        where: { id: userId },
        include: {
          blockedBy: {
            where: { id },
          },
        },
      }),
      this.userService.findUserById(id, UserData),
    ]);

    if (!me || !user) throw new WsUserNotFoundException();

    if (me.blockedBy.length > 0) {
      throw new WsBadRequestException(
        'You cannot play with a user that have blocked you',
      );
    }

    const myGame = this.pongService.checkIfUserIsAlreadyInARoom(userId);

    if (!this.getAllSockeIdsByKey(user.id))
      throw new WsUnknownException('User is not online');
    if (myGame) {
      if (!myGame.hasStarted) {
        throw new WsBadRequestException(
          "You can't invite a user while still in queue, please unqueue first",
        );
      }

      if (myGame.hasStarted) {
        throw new WsBadRequestException(
          "You can't invite a user while playing a game",
        );
      }
    }
    const gameUser = this.pongService.checkIfUserIsAlreadyInARoom(id);

    if (gameUser) {
      if (!gameUser.hasStarted) {
        throw new WsBadRequestException(
          'User must leave queue before to receive game invitation',
        );
      }

      if (gameUser.hasStarted) {
        throw new WsBadRequestException('User is already in a game');
      }
    }

    const response = this.pongService.isUserInvitable(id);

    if (response) throw new WsUnauthorizedException(response);

    const gameInvit = this.pongService.addNewGameInvitation(
      PONG_ROOM_PREFIX + userId,
      client.id,
      userId,
      id,
      pongType,
    );

    if (gameInvit) {
      throw new WsUnauthorizedException(
        `You already sent an invitation to another player, you must wait ${gameInvit} seconds before sending a new one, or cancel the previous one`,
      );
    }

    client.emit(GeneralEvent.SUCCESS, {
      message: `Game invitation succesfully sent to ${user.nickname}`,
    });

    this.libService.sendToSocket(
      this.server,
      id,
      PongEvent.RECEIVE_GAME_INVITATION,
      {
        message: `${me.nickname} invited you to a play ${
          pongType === PongTypeNormal ? 'normal' : 'special'
        } pong game`,
        data: { id: userId },
      },
    );
  }

  @SubscribeMessage(PongEvent.JOIN_BACK_CURRENT_GAME)
  async joinCurrentGame(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { gameId }: GameIdDto,
  ) {
    const game = this.pongService.getGameByGameId(gameId);

    if (!game) throw new WsNotFoundException('Game not found');

    if (game.endGame()) throw new WsUnknownException('Game ended');

    this.libService.emitBackToMyself(client, GeneralEvent.SUCCESS, {
      data: {
        gameId,
      },
    });
  }

  @SubscribeMessage(PongEvent.ACCEPT_GAME_INVITATION)
  async acceptGameInvitation(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { id }: UserIdDto,
  ) {
    const { userId } = client;

    const [me, user] = await Promise.all([
      this.userService.findUserById(userId, UserData),
      this.userService.findUserById(id, UserData),
    ]);

    if (!me || !user) throw new WsUserNotFoundException();

    const myGame = this.pongService.checkIfUserIsAlreadyInARoom(userId);

    if (myGame) {
      if (!myGame.hasStarted) {
        throw new WsBadRequestException(
          "You can't accept an invitation while still in queue, please unqueue first",
        );
      }

      if (myGame.hasStarted) {
        throw new WsBadRequestException(
          "You can't accept an invitation while playing a game",
        );
      }
    }

    const gameUser = this.pongService.checkIfUserIsAlreadyInARoom(id);

    if (gameUser) {
      if (!gameUser.hasStarted) {
        throw new WsBadRequestException('The user is currently in queue, ');
      }

      if (gameUser.hasStarted) {
        throw new WsBadRequestException('User is already in a game');
      }
    }

    const invitation = this.pongService.getInvitation(id, userId);

    if (!invitation) {
      throw new WsBadRequestException(
        'That user did not send you any invitation',
      );
    }

    if (!invitation.hasNotExpired())
      throw new WsUnauthorizedException(
        `User invitaion has expired, invitation last at most ${GAME_INVITATION_TIME_LIMIT}`,
      );

    const gameId: string = invitation.getGameId;
    const senderSocket = this.libService.getSocket(
      this.server,
      invitation.getSocketId,
    );

    if (!senderSocket) {
      throw new WsUnknownException(`${user.nickname} is currently not online`);
    }

    this.pongService.addNewGameRoom({
      gameId,
      id,
      userId,
      socketId: invitation.getSocketId,
      otherSocketId: client.id,
      pongGameType: invitation.getPongType,
    });

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS);

    await this.pongService.joinGame(
      this.server,
      gameId,
      {
        creator: { nickname: user.nickname, avatar: user.profile.avatar },
        opponent: { nickname: me.nickname, avatar: me.profile.avatar },
      },
      userId,
      id,
      client,
      senderSocket as SocketWithAuth,
    );
  }

  @SubscribeMessage(PongEvent.UPDATE_PLAYER_POSITION)
  updatePlayerPostion(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { gameId, keyPressed }: UpdatePlayerPositionDto,
  ) {
    const { userId } = client;
    const [game, index] =
      this.pongService.getGameByGameIdAndReturnIndex(gameId);

    if (index === -1) throw new WsGameNotFoundException();

    if (!game.getPlayers.includes(userId))
      throw new WsUnauthorizedException('You are not allowed to move paddle!');

    this.pongService.updateGamePlayerPosition(index, userId, keyPressed);
  }

  @SubscribeMessage(PongEvent.USER_STOP_UPDATE)
  stopUserMovement(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { gameId, keyPressed }: UpdatePlayerPositionDto,
  ) {
    const { userId } = client;
    const game = this.pongService.getGameByGameId(gameId);

    if (!game) throw new WsGameNotFoundException();

    if (!game.getPlayers.includes(userId))
      throw new WsUnauthorizedException('You are not allowed to move paddle!');

    game.stopUpdatePlayerPosition(userId, keyPressed);

    this.pongService.updateGameByGameId(gameId, game);
  }

  @SubscribeMessage(PongEvent.DECLINE_GAME_INVITATION)
  async declineGameInvitation(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() { id }: UserIdDto,
  ) {
    const { userId } = client;

    const [me, user] = await Promise.all([
      this.userService.findUserById(userId, UserData),
      this.userService.findUserById(id, UserData),
    ]);

    if (!me || !user) throw new WsUserNotFoundException();
    const gameId = this.pongService.deleteInvitation(id);

    if (gameId) {
      this.libService.sendToSocket(
        this.server,
        id,
        PongEvent.USER_DECLINED_INVITATION,
        {
          message: `${me.nickname} has declined your game invitation`,
          severity: 'info',
        },
      );
    }

    this.libService.sendToSocket(this.server, userId, GeneralEvent.SUCCESS);
  }

  /*------------------------------------------------------------------------------------------------------ */

  /*------------------------------------------------------------------------------------------------------ */

  private getAllSockeIdsByKey(key: string) {
    return this.server.of('/').adapter.rooms.get(key);
  }

  private deleteAllSocketIdsBy(key: string) {
    return this.server.of('/').adapter.rooms.delete(key);
  }

  private joinOrLeaveRoom(
    userId: string,
    action: GeneralEvent.JOIN | GeneralEvent.LEAVE,
    room: string,
  ) {
    const socketIds = this.getAllSockeIdsByKey(userId);
    if (socketIds) {
      if (action === GeneralEvent.LEAVE) {
        socketIds.forEach((socketId) => {
          this.libService.getSocket(this.server, socketId).leave(room);
        });
        return;
      }
      socketIds.forEach((socketId) => {
        this.libService.getSocket(this.server, socketId).join(room);
      });
    }
  }
  /*------------------------------------------------------------------------------------------------------ */
}
