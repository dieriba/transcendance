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
import { ROLE, TYPE, Chatroom, RESTRICTION, STATUS } from '@prisma/client';
import {
  ChatEventPrivateRoom,
  FriendEvent,
  GeneralEvent,
  ChatEventGroup,
} from '../../../shared/socket.event';
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
} from 'src/chat/dto/chatroom.dto';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import {
  WsBadRequestException,
  WsUnknownException,
  WsUnauthorizedException,
  WsNotFoundException,
} from 'src/common/custom-exception/ws-exception';
import { WsCatchAllFilter } from 'src/common/global-filters/ws-exception-filter';
import { WsAccessTokenGuard } from 'src/common/guards/ws.guard';
import { ChatroomBaseData } from 'src/common/types/chatroom-info-type';
import { SocketServerResponse } from 'src/common/types/socket-types';
import { UserData, UserId } from 'src/common/types/user-info.type';
import { LibService } from 'src/lib/lib.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { GatewayService } from './gateway.service';
import {
  FriendsTypeNicknameDto,
  FriendsTypeDto,
} from 'src/friends/dto/friends.dto';
import { IsFriendExistWs } from 'src/friends/pipe/is-friend-exist-ws.pipe';
import { FriendsService } from 'src/friends/friends.service';
import { CheckGroupCreationValidity } from 'src/chat/pipes/check-group-creation-validity.pipe';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { ChatRoomNotFoundException } from 'src/chat/exception/chatroom-not-found.exception';
import { ChatRoute } from 'src/common/custom-decorator/metadata.decorator';
import { IsRestrictedUserGuard } from 'src/chat/guards/is-restricted-user.guard.ws';

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
  ) {}

  private readonly logger = new Logger(GatewayGateway.name);

  @WebSocketServer()
  server: Server;
  /*----------------------------------------------------------------------------- */
  handleConnection(client: SocketWithAuth) {
    const { sockets } = this.server.sockets;

    this.logger.log(
      `WS client with id: ${client.id} and userId : ${client.userId} connected!`,
    );
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    client.join(client.userId);
    const rooms = this.server.of('/').adapter.rooms;
    console.log({ rooms });

    client.broadcast.emit(GeneralEvent.USER_LOGGED_IN, {
      data: { friendId: client.userId },
    });
  }

  handleDisconnect(client: SocketWithAuth) {
    const { sockets } = this.server.sockets;

    this.logger.log(`WS client with id: ${client.id} disconnected!`);
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    const rooms = this.server.sockets.adapter.rooms.get(client.userId);

    if (!rooms) {
      console.log('LOGGED OUT');

      client.broadcast.emit(GeneralEvent.USER_LOGGED_OUT, {
        data: { friendId: client.userId },
      });
    }
  }

  @SubscribeMessage(ChatEventGroup.CREATE_GROUP_CHATROOM)
  async createChatroom(
    @MessageBody(CheckGroupCreationValidity) chatroomDto: ChatRoomDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.log('ok');

    const { users, ...chatroom } = chatroomDto;
    const { chatroomName } = chatroom;
    const { userId } = client;

    const user = await this.userService.findUserById(client.userId, UserData);

    if (!user) throw new WsUnknownException('User not found');

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

    this.logger.log({ users });

    let existingUserId: string[] = [];

    if (users && users.length > 0)
      existingUserId = await this.userService.getExistingUserFriend(
        userId,
        users,
        UserId,
      );
    this.logger.log({ existingUserId });

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

    this.logger.log({ existingUserId });

    const { id, type } = newChatroom;

    existingUserId.map((user) => {
      this.sendToSocket(this.server, user, ChatEventGroup.NEW_CHATROOM, {
        message: '',
        data: { id, chatroomName, type, messages: [], restrictedUsers: [] },
      });

      const rooms = this.server.of('/').adapter.rooms;

      const socketIds = rooms.get(user);

      if (socketIds) {
        socketIds.forEach((socket) => {
          this.server.sockets.sockets.get(socket).join(chatroomName);
        });
      }

      if (user === userId) {
        this.sendToSocket(this.server, user, GeneralEvent.SUCCESS, {
          message: 'Group created succesfully',
          data: {},
        });
      }
    });

    if (newChatroom.type === TYPE.PUBLIC || newChatroom.type === TYPE.PROTECTED)
      client.broadcast.emit(ChatEventGroup.NEW_AVAILABLE_CHATROOM, {
        data: {
          id: newChatroom.id,
          type: newChatroom.type,
          chatroomName: newChatroom.chatroomName,
        },
      });
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

    if (!chatroom) throw new ChatRoomNotFoundException();

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

    this.sendToSocket(
      client,
      chatroom.chatroomName,
      ChatEventGroup.UPDATED_GROUP_CHATROOM,
      {
        message: `${chatroom.chatroomName} is now ${type}`,
        data: { chatroomId, type },
      },
    );

    this.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: 'Group edited succesflly',
      data: { chatroomId, type },
    });

    if (type !== TYPE.PRIVATE) {
      client.broadcast.emit(ChatEventGroup.NEW_AVAILABLE_CHATROOM, {
        data: {
          id: chatroomId,
          type: type,
          chatroomName: chat.chatroomName,
        },
      });
    } else {
      client.broadcast.emit(ChatEventGroup.DELETE_JOINABLE_GROUP, {
        data: { chatroomId },
      });
    }
  }

  //@SubscribeMessage(CHATROOM_ADD_USER)
  async addNewUserToChatroom(
    @MessageBody() chatRoomData: ChatroomDataDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { users, chatroomId } = chatRoomData;
    this.logger.log({ chatroomId, users });
    const { userId } = client;

    /*CHECK IF USER IS CHAT OWNER */
    await this.isDieriba(userId, chatroomId);

    const existingUserAndNonBlocked =
      await this.userService.getExistingUserFriend(userId, users, UserData);

    this.logger.log({ existingUserAndNonBlocked });
    const newUsers = await this.prismaService.$transaction(
      existingUserAndNonBlocked.map((userId) =>
        this.chatroomUserService.createNewChatroomUser(userId, chatroomId),
      ),
    );
    //this.server.emit(CHATROOM_USER_ADDED, newUsers);
  }

  @SubscribeMessage(ChatEventGroup.SET_DIERIBA)
  async setNewChatroomDieriba(
    @MessageBody() dieribaDto: DieribaDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { id, chatroomId, chatroomName } = dieribaDto;
    const { userId } = client;
    await this.isDieriba(userId, chatroomId);
    if (id === userId)
      throw new WsBadRequestException(
        'You already are the DIERIBA of that chatroom',
      );

    const [chatroomUser, restrictedUser] = await Promise.all([
      this.chatroomUserService.findChatroomUser(chatroomId, id),
      this.prismaService.restrictedUser.findFirst({ where: { userId: id } }),
    ]);

    if (!chatroomUser)
      throw new WsUnknownException('That user do not belong to that group');

    const now = new Date();

    if (restrictedUser && restrictedUser.restrictionTimeEnd > now)
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

    this.sendToSocket(client, chatroomName, ChatEventGroup.NEW_ADMIN, {
      message: `${updateNewDieriba.user.nickname} is now admin of that group!`,
      data: { id, role: chatroomUser.role },
    });

    this.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: '',
      data: { id, role: chatroomUser.role },
    });

    console.log('MDR');
  }

  //@SubscribeMessage(CHATROOM_DELETE_USER)
  async deleteUserFromChatromm(
    @MessageBody() chatroomData: ChatroomDataDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { userId } = client;
    const { users, chatroomId } = chatroomData;

    await this.isDieriba(userId, chatroomId);
    const creator = users.find((user) => user == userId);

    if (creator)
      throw new WsBadRequestException(
        'Cannot delete the CHATROOM owner of that room',
      );

    const deletedUsers = await this.prismaService.chatroomUser.deleteMany({
      where: {
        chatroomId: chatroomId,
        userId: {
          in: users,
        },
      },
    });

    //this.server.emit(CHATROOM_USER_DELETED, deletedUsers);
  }

  @SubscribeMessage(ChatEventGroup.CHANGE_USER_ROLE)
  async changeUserRole(
    @MessageBody() changeUserRoleDto: ChangeUserRoleDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { id, role, chatroomId, chatroomName } = changeUserRoleDto;
    const { userId } = client;

    await this.isDieriba(userId, chatroomId);

    const chatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      id,
    );

    if (!chatroomUser)
      throw new WsBadRequestException('User does not belong to that group');

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

    if (chatroomUser.role === ROLE.CHAT_ADMIN) {
      this.sendToSocket(
        client,
        chatroomName,
        ChatEventGroup.USER_ROLE_CHANGED,
        {
          message: `${chatroomUser.user.nickname} is no longer a chat moderator`,
          data: { id, role: chatroomUser.role },
        },
      );
    } else {
      this.sendToSocket(
        client,
        chatroomName,
        ChatEventGroup.USER_ROLE_CHANGED,
        {
          message: `${chatroomUser.user.nickname} is now a chat moderator`,
          data: { id, role: chatroomUser.role },
        },
      );
    }

    this.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: `${chatroomUser.user.nickname} is now a ${
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

    if (chatroomUser.role !== ROLE.DIERIBA) {
      if (
        userToRestrict.role === ROLE.DIERIBA ||
        userToRestrict.role === ROLE.CHAT_ADMIN
      )
        throw new WsBadRequestException('Cannot Restrict chat admin');
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
        const rooms = this.server.of('/').adapter.rooms;

        const socketIds = rooms.get(id);

        if (socketIds) {
          socketIds.forEach((socket) => {
            this.server.sockets.sockets.get(socket).leave(chatroomName);
          });
        }
      }

      this.sendToSocket(
        this.server,
        id,
        ChatEventGroup.USER_BANNED_MUTED_KICKED_RESTRICTION,
        {
          message: '',
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

      this.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
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

      this.sendToSocket(client, chatroomName, ChatEventGroup.USER_RESTRICTED, {
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
        message: `${nickname} has been ${restriction} for ${
          duration === Number.MAX_SAFE_INTEGER
            ? 'life'
            : `${duration} ${durationUnit}`
        }`,
      });
    });
  }

  @SubscribeMessage(ChatEventGroup.UNRESTRICT_USER)
  async unrestrictUser(
    @MessageBody()
    unrestrictedUserDto: UnrestrictedUsersDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { userId } = client;

    const [chatroomUser, restrictedUser] = await Promise.all([
      this.chatroomUserService.findChatroomUser(
        unrestrictedUserDto.chatroomId,
        userId,
      ),
      this.prismaService.restrictedUser.findUnique({
        where: {
          userId_chatroomId: {
            userId: unrestrictedUserDto.id,
            chatroomId: unrestrictedUserDto.chatroomId,
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

    const { isChatAdmin, chatroomId, id } = unrestrictedUserDto;

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
        chatroomId: true,
        messageTypes: true,
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

    this.sendToSocket(
      this.server,
      id,
      ChatEventGroup.USER_UNBANNED_UNKICKED_UNMUTED,
      {
        message: '',
        data: { message, chatroomId, restriction },
      },
    );

    if (restriction !== RESTRICTION.MUTED) {
      const rooms = this.server.of('/').adapter.rooms;

      const socketIds = rooms.get(id);

      if (socketIds) {
        socketIds.forEach((socket) => {
          this.server.sockets.sockets.get(socket).join(chatroomName);
        });
      }
    }

    this.sendToSocket(client, chatroomName, ChatEventGroup.USER_UNRESTRICTED, {
      data: { user: { ...user, banLife: restrictedUser.banLife } },
      message: '',
    });

    this.sendToSocket(this.server, client.userId, GeneralEvent.SUCCESS, {
      data: { ...user, banLife: restrictedUser.banLife },
      message: `${user.nickname} is no longer ${restriction}`,
    });
  }

  @SubscribeMessage(ChatEventGroup.REQUEST_ALL_CHATROOM)
  async getUserGroupChatroom(@ConnectedSocket() client: SocketWithAuth) {
    const { userId } = client;
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new WsNotFoundException('User not foud');

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
      },
      select: {
        id: true,
        chatroomName: true,
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
                  },
                },
              },
            },
            content: true,
            messageTypes: true,
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
        updatedAt: 'desc',
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

    this.sendToSocket(this.server, userId, ChatEventGroup.GET_ALL_CHATROOM, {
      message: '',
      data: chatrooms,
    });
  }

  @SubscribeMessage(ChatEventGroup.REQUEST_ALL_CHATROOM_MESSAGE)
  @UseGuards(IsRestrictedUserGuard)
  async getGroupChatroomMessage(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('chatroomId') chatroomId: string,
  ) {
    const { userId } = client;
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new WsNotFoundException('User not found');

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
        OR: [
          {
            users: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        chatroomName: true,
        messages: {
          where: {
            user: {
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
            messageTypes: true,
          },
        },
      },
    });

    if (!chatroom)
      throw new WsNotFoundException(
        'Chat does not exist or user is not part of that chat',
      );

    this.sendToSocket(
      this.server,
      client.userId,
      ChatEventGroup.GET_ALL_CHATROOM_MESSAGE,
      {
        message: '',
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
  @UseGuards(IsRestrictedUserGuard)
  async joinChatroom(
    @MessageBody() joinChatroomDto: JoinChatroomDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { chatroomId } = joinChatroomDto;
    const { userId } = client;
    this.logger.log(`password: [${joinChatroomDto.password}]`);

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
                  },
                },
              },
            },
            content: true,
            messageTypes: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    if (!chatroom) throw new WsUnknownException('Chatroom not found');

    const foundChatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    if (foundChatroomUser)
      throw new WsBadRequestException('You already belong to that group');

    const { password, ...data } = chatroom;

    if (chatroom.type === TYPE.PRIVATE) {
      throw new WsUnauthorizedException(
        "You can't join that private chatroom, you need to be invited first",
      );
    } else if (chatroom.type === TYPE.PROTECTED) {
      const match = await this.argon2Service.compare(
        password,
        joinChatroomDto.password,
      );

      if (!match)
        throw new WsUnauthorizedException(
          "Wrong password, you can't acces that chatroom",
        );
    }
    const { user } = await this.chatroomUserService.createNewChatroomUser(
      userId,
      chatroomId,
    );

    this.sendToSocket(
      this.server,
      chatroom.chatroomName,
      ChatEventGroup.NEW_USER_CHATROOM,
      {
        message: `${client.nickname} has joined the group`,
        data: {
          ...user,
        },
      },
    );

    this.sendToSocket(this.server, userId, GeneralEvent.SUCCESS, {
      message: `Succesfully joined the group: ${chatroom.chatroomName}`,
      data,
    });
  }

  @SubscribeMessage(ChatEventGroup.SEND_GROUP_MESSAGE)
  @ChatRoute()
  @UseGuards(IsRestrictedUserGuard)
  async sendMessageToChatroom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() chatroomMessageDto: ChatroomMessageDto,
  ) {
    const { userId } = client;
    const { chatroomId, content, messageTypes, image } = chatroomMessageDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        blockedBy: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) throw new UserNotFoundException();

    const chatroom = await this.chatroomService.findChatroom(
      chatroomId,
      ChatroomBaseData,
    );

    if (!chatroom) throw new WsNotFoundException('Chatroom not found');

    const res = await this.prismaService.message.create({
      data: {
        content: content,
        imageUrl: image,
        messageTypes,
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
        messageTypes: true,
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

    this.sendToSocket(
      this.server,
      chatroom.chatroomName,
      ChatEventGroup.RECEIVE_GROUP_MESSAGE,
      {
        message: '',
        data: {
          id: res.id,
          content,
          chatroomId,
          messageTypes,
          user: {
            id: userId,
            nickname: client.nickname,
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
    const { friendId, content, chatroomId, messageTypes, image } = message;
    const { userId } = client;

    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new WsNotFoundException('User not found');

    const chatroom = await this.chatroomService.findChatroom(
      chatroomId,
      ChatroomBaseData,
    );

    if (!chatroom) throw new WsNotFoundException('Chatroom does not exist');
    //CHECK IF USER HAS DELETED ME OR BLOCKED ME
    const res = await this.prismaService.message.create({
      data: {
        content: content,
        imageUrl: image,
        messageTypes,
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
      },
    });

    this.sendToSocket(
      this.server,
      friendId,
      ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE,
      {
        message: '',
        data: {
          id: res.id,
          chatroomId,
          userId,
          content,
          messageTypes,
        },
      },
    );

    this.server
      .to(client.userId)
      .emit(ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE, {
        message: '',
        data: {
          id: res.id,
          chatroomId,
          userId,
          content,
          messageTypes,
        },
      });
  }

  private async isDieriba(userId: string, chatroomId: string): Promise<void> {
    const chatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    this.logger.log({ chatroomUser });

    if (!chatroomUser)
      throw new WsNotFoundException(
        'The chatroom does not exists or User is not part of it',
      );

    if (chatroomUser.role !== ROLE.DIERIBA)
      throw new WsUnauthorizedException(
        `You have no right to perform the requested action in the groupe named ${chatroomUser.chatroom.chatroomName}`,
      );
  }

  /*------------------------------------------------------------------------------------------------------ */
  @SubscribeMessage(FriendEvent.REQUEST_SENT)
  async sendFriendRequest(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() body: FriendsTypeNicknameDto,
  ) {
    const { nickname } = body;
    const userId = client.userId;
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

    this.sendToSocket(this.server, friendId, FriendEvent.NEW_REQUEST_RECEIVED, {
      message: `You received a friend request from ${client.nickname}`,
      data: {
        friendId: client.userId,
      },
    });

    this.sendToSocket(this.server, friendId, FriendEvent.ADD_NEW_REQUEST, {
      message: '',
      data: {
        createdAt: request.createdAt,
        sender: {
          nickname: client.nickname,
          id: client.userId,
          profile: { avatar: user.profile?.avatar },
        },
      },
    });

    this.sendToSocket(
      this.server,
      client.userId,
      FriendEvent.NEW_REQUEST_SENT,
      {
        message: '',
        data: {
          recipient: {
            nickname: friend.nickname,
            id: friend.id,
            profile: { avatar: friend.profile?.avatar },
          },
        },
      },
    );

    this.sendToSocket(this.server, client.userId, GeneralEvent.SUCCESS, {
      message: 'Friend request succesfully sent',
      data: {},
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

    this.sendToSocket(this.server, friendId, FriendEvent.CANCEL_REQUEST, {
      message: '',
      data: { friendId: client.userId },
    });

    this.sendToSocket(this.server, client.userId, FriendEvent.CANCEL_REQUEST, {
      message: 'Friend request declined succesfully',
      data: {
        friendId,
      },
    });

    this.sendToSocket(this.server, client.userId, GeneralEvent.SUCCESS, {
      message: 'Friend request declined succesfully',
      data: {},
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

    let chatroom: Partial<Chatroom>;
    const { sender, recipient } = existingFriendRequest;
    const res = await this.prismaService.$transaction(async (tx) => {
      await tx.friendRequest.delete({
        where: {
          senderId_recipientId: {
            senderId: existingFriendRequest.senderId,
            recipientId: existingFriendRequest.recipientId,
          },
        },
      });

      chatroom = await tx.chatroom.findFirst({
        where: {
          type: TYPE.DM,
          AND: [
            { users: { some: { userId: existingFriendRequest.senderId } } },
            { users: { some: { userId: existingFriendRequest.recipientId } } },
          ],
        },
        select: {
          id: true,
          users: {
            where: {
              userId: {
                not: userId,
              },
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
            },
          },
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (chatroom) {
        await tx.chatroom.update({
          where: {
            id: chatroom.id,
          },
          data: {
            active: true,
          },
        });
        chatroom.active = true;
      } else {
        chatroom = await tx.chatroom.create({
          data: {
            type: TYPE.DM,
            users: {
              create: [{ userId: userId }, { userId: friendId }],
            },
          },
          select: {
            id: true,
            users: {
              where: {
                userId: {
                  not: userId,
                },
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
              },
            },
            messages: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        });
      }
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
    });

    this.sendToSocket(this.server, friendId, FriendEvent.CANCEL_REQUEST, {
      message: '',
      data: { friendId: client.userId },
    });

    this.sendToSocket(this.server, client.userId, FriendEvent.CANCEL_REQUEST, {
      message: '',
      data: { friendId },
    });

    this.sendToSocket(this.server, friendId, FriendEvent.NEW_REQUEST_ACCEPTED, {
      message: `${client.nickname} accepted your friend request`,
      data: { friendId: client.userId },
    });

    this.server
      .to(client.userId)
      .emit(FriendEvent.REQUEST_ACCEPTED_FROM_RECIPIENT, {
        message: `You are now friend with ${
          friendId === sender.id ? sender.nickname : recipient.nickname
        }`,
        data: { friendId },
      });

    this.sendToSocket(this.server, friendId, FriendEvent.NEW_FRIEND, {
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
          status:
            sender.id === client.userId ? sender.status : recipient.status,
        },
      },
    });

    this.sendToSocket(this.server, client.userId, FriendEvent.NEW_FRIEND, {
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
          status:
            sender.id === client.userId ? sender.status : recipient.status,
        },
      },
    });

    this.sendToSocket(
      this.server,
      client.userId,
      ChatEventPrivateRoom.NEW_CHATROOM,
      {
        message: '',
        data: chatroom,
      },
    );

    this.sendToSocket(
      this.server,
      friendId,
      ChatEventPrivateRoom.NEW_CHATROOM,
      {
        message: '',
        data: chatroom,
      },
    );
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
    let chatroomId: string;
    if (!existingFriendship)
      throw new WsBadRequestException(
        'You cannot delete user that are not your friend with',
      );
    const res = await this.prismaService.$transaction(async (tx) => {
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
        chatroomId = chatroom.id;
        await tx.chatroom.update({
          where: { id: chatroom.id },
          data: { active: false },
        });
      }
    });
    this.logger.log({ res });
    this.sendToSocket(this.server, friendId, FriendEvent.DELETE_FRIEND, {
      message: '',
      data: { friendId: client.userId },
    });
    this.sendToSocket(
      this.server,
      friendId,
      ChatEventPrivateRoom.CLEAR_CHATROOM,
      {
        message: `${client.nickname} deleted you as friend`,
        data: { chatroomId },
      },
    );
    this.server
      .to(client.userId)
      .emit(FriendEvent.DELETE_FRIEND, { message: '', data: { friendId } });
    this.server
      .to(client.userId)
      .emit(GeneralEvent.SUCCESS, { message: 'Friend Deleted!' });
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
      await this.prismaService.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: friendId } } },
        });
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
          this.sendToSocket(
            this.server,
            friendId,
            ChatEventPrivateRoom.CLEAR_CHATROOM,
            {
              message: `${client.nickname} deleted you as friend`,
              data: { chatroomId: chatroom.id },
            },
          );
        }
      });
      this.sendToSocket(this.server, friendId, FriendEvent.DELETE_FRIEND, {
        message: '',
        data: { friendId: client.userId },
      });

      this.sendToSocket(this.server, client.userId, FriendEvent.DELETE_FRIEND, {
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
      this.sendToSocket(
        this.server,
        client.userId,
        FriendEvent.CANCEL_REQUEST,
        {
          message: '',
          data: { friendId },
        },
      );
      this.sendToSocket(this.server, friendId, FriendEvent.CANCEL_REQUEST, {
        message: '',
        data: { friendId: client.userId },
      });
    } else {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { blockedUsers: { connect: { id: friendId } } },
      });
    }

    this.server
      .to(client.userId)
      .emit(GeneralEvent.SUCCESS, { message: 'User blocked succesfully' });
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

      this.sendToSocket(
        this.server,
        client.userId,
        FriendEvent.UNBLOCK_FRIEND,
        {
          message: '',
          data: { friendId },
        },
      );
    }
    this.server
      .to(client.userId)
      .emit(GeneralEvent.SUCCESS, { message: 'User unblocked!' });
  }

  private sendToSocket(
    instance: SocketWithAuth | Server,
    room: string,
    emit: string,
    object?: SocketServerResponse,
  ) {
    instance.to(room).emit(emit, object);
  }
  /*------------------------------------------------------------------------------------------------------ */
}
