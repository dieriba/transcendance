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
import { ROLE, TYPE, MESSAGE_TYPES, Chatroom } from '@prisma/client';
import {
  ChatEventPrivateRoom,
  FriendEvent,
  GeneralEvent,
  ChatEventGroup,
} from '@shared/socket.event';
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
} from 'src/chat/dto/chatroom.dto';
import { isDieribaOrAdmin } from 'src/chat/pipes/is-dieriba-or-admin.pipe';
import { IsDieriba } from 'src/chat/pipes/is-dieriba.pipe';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { BAD_REQUEST } from 'src/common/constant/http-error.constant';
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
import {
  UserBlockList,
  UserData,
  UserId,
} from 'src/common/types/user-info.type';
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
import { IsRestrictedUserGuard } from 'src/chat/guards/is-restricted-user.guard';

@UseGuards(WsAccessTokenGuard)
@UseFilters(WsCatchAllFilter)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway()
export class GatewayGateway {
  constructor(
    private readonly gatewayService: GatewayService,
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
    this.gatewayService.setUserSocket(client.userId, client);
    this.logger.log(
      `Size of socket map ${this.gatewayService.getSockets().size}`,
    );
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
    this.logger.log(
      `Size of socket map ${this.gatewayService.getSockets().size}`,
    );
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
      this.sendToSocket(user, ChatEventGroup.NEW_CHATROOM, {
        message: '',
        data: { id, chatroomName, type, messages: [] },
      });
      if (user === userId) {
        this.sendToSocket(user, GeneralEvent.SUCCESS, {
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

  //@SubscribeMessage(CHATROOM_SET_DIERIBA)
  async setNewChatroomDieriba(
    @MessageBody(IsDieriba) dieribaDto: DieribaDto,
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
      this.prismaService.restrictedUser.findFirst({ where: { userId: id } }),
    ]);

    this.logger.log({ chatroomUser, id, userId, restrictedUser });

    if (!chatroomUser) throw new WsUnknownException('User Not Found');

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

    const [updateMe, updateNewDieriba] = await this.prismaService.$transaction([
      this.prismaService.chatroomUser.update({
        where: { userId_chatroomId: { userId, chatroomId } },
        data: { role: ROLE.REGULAR_USER },
      }),
      this.prismaService.chatroomUser.update({
        where: { userId_chatroomId: { userId: id, chatroomId } },
        data: { role: ROLE.DIERIBA },
      }),
    ]);

    //this.server.emit(CHATROOM_NEW_DIERIBA, { updateMe, updateNewDieriba });
  }

  //@SubscribeMessage(CHATROOM_DELETE_USER)
  async deleteUserFromChatromm(
    @MessageBody(IsDieriba) chatroomData: ChatroomDataDto,
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

  //@SubscribeMessage(CHATROOM_CHANGE_USER_ROLE)
  async changeUserRole(
    @MessageBody(IsDieriba) changeUserRoleDto: ChangeUserRoleDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { users, chatroomId } = changeUserRoleDto;
    const { userId } = client;
    await this.isDieriba(userId, chatroomId);
    const idSet = new Set(users.map((user) => user.id));

    if (idSet.size !== users.length)
      throw new WsBadRequestException(BAD_REQUEST);

    const foundUser = new Set(
      await this.userService.getExistingUserFriend(
        userId,
        users.map((user) => user.id),
        UserData,
      ),
    );

    if (foundUser.size === 0)
      throw new WsUnknownException('None of the given user exist');

    const existingUsers = users.filter((user) => idSet.has(user.id));

    const chatroom = await this.prismaService.chatroom.findUnique({
      where: { id: chatroomId },
    });

    if (!chatroom) throw new WsUnknownException('Chatroom not found');

    const updatedChatroomsUser = await this.prismaService.$transaction(
      existingUsers.map((user) =>
        this.prismaService.chatroomUser.update({
          where: {
            userId_chatroomId: {
              userId: user.id,
              chatroomId,
            },
          },
          data: {
            role: user.role,
          },
        }),
      ),
    );

    //this.server.emit(CHATROOM_USER_ROLE_CHANGED, updatedChatroomsUser);
  }

  //@SubscribeMessage(CHATROOM_RESTRICT_USER)
  async restrictUser(
    @MessageBody() restrictedUserDto: RestrictedUsersDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    await this.isDieribaOrAdmin(restrictedUserDto);

    const date = new Date();
    const { userId } = client;
    const {
      chatroomId,
      id,
      duration,
      restriction,
      durationUnit,
      reason,
      isChatAdmin,
    } = restrictedUserDto;

    const restrictedUser = this.prismaService.restrictedUser.upsert({
      where: {
        userId_chatroomId: {
          userId: id,
          chatroomId: chatroomId,
        },
      },
      update: {
        adminId: userId,
        restriction: restriction,
        restrictionTimeStart: date,
        restrictionTimeEnd: this.libService.getEndBanTime(
          durationUnit,
          date,
          duration,
        ),
        reason,
      },
      create: {
        adminId: userId,
        userId: id,
        chatroomId,
        restriction: restriction,
        restrictionTimeStart: date,
        restrictionTimeEnd: this.libService.getEndBanTime(
          durationUnit,
          date,
          duration,
        ),
        reason,
      },
    });

    if (duration === Number.MAX_SAFE_INTEGER) {
      const deletedUser = this.prismaService.chatroomUser.delete({
        where: {
          userId_chatroomId: {
            userId: id,
            chatroomId,
          },
        },
      });

      const data = await this.prismaService.$transaction([
        restrictedUser,
        deletedUser,
      ]);
      //this.server.emit(CHATROOM_USER_RESTRICT_LIFE, data);
    } else if (isChatAdmin) {
      const oldAdmin = this.prismaService.chatroomUser.update({
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
      const data = await this.prismaService.$transaction([
        restrictedUser,
        oldAdmin,
      ]);
      //this.server.emit(CHATROOM_USER_RESTRICT_CHAT_ADMIN, data);
    } else {
      const data = await restrictedUser;
      //this.server.emit(CHATROOM_USER_RESTRICTED, data);
    }
  }

  //@SubscribeMessage(CHATROOM_UNRESTRICT_USER)
  async unrestrictUser(
    @MessageBody(isDieribaOrAdmin) unrestrictedUserDto: UnrestrictedUsersDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    await this.isDieribaOrAdmin(unrestrictedUserDto);

    const { userId } = client;
    const { chatroomId, id, isChatAdmin } = unrestrictedUserDto;

    const unrestrictedUser = await this.prismaService.restrictedUser.findFirst({
      where: { userId: id },
    });

    if (!unrestrictedUser)
      throw new WsUnknownException(
        "The user either don't exist or have not been restricted",
      );

    if (isChatAdmin && userId !== unrestrictedUser.adminId) {
      throw new WsUnauthorizedException(
        'Only Dieriba or admin who restricted that use can unrestrict him',
      );
    }

    const data = await this.prismaService.restrictedUser.delete({
      where: {
        userId_chatroomId: {
          userId: id,
          chatroomId,
        },
      },
    });
    //this.server.emit(CHATROOM_USER_UNRESTRICTED, data);
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
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    this.sendToSocket(userId, ChatEventGroup.GET_ALL_CHATROOM, {
      message: '',
      data: chatrooms,
    });

    chatrooms.map((chatroom) => client.join(chatroom.chatroomName));
  }

  @SubscribeMessage(ChatEventGroup.REQUEST_ALL_CHATROOM_MESSAGE)
  async getGroupChatroomMessage(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('chatroomId') chatroomId: string,
  ) {
    const { userId } = client;
    const user = await this.userService.findUserById(userId, UserData);
    console.log(chatroomId);

    if (!user) throw new WsNotFoundException('User not found');

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
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

    if (!chatroom) throw new WsNotFoundException('Chat does not exist');

    this.sendToSocket(client.userId, ChatEventGroup.GET_ALL_CHATROOM_MESSAGE, {
      message: '',
      data: chatroom.messages,
    });

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
        type: true,
        password: true,
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
    });

    if (!chatroom) throw new WsUnknownException('Chatroom not found');

    const foundChatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    if (foundChatroomUser)
      throw new WsBadRequestException('You already belong to that group');

    if (chatroom.type === TYPE.PRIVATE) {
      throw new WsUnauthorizedException(
        "You can't join that private chatroom, you need to be invited first",
      );
    } else if (chatroom.type === TYPE.PROTECTED) {
      const match = await this.argon2Service.compare(
        chatroom.password,
        joinChatroomDto.password,
      );

      if (!match)
        throw new WsUnauthorizedException(
          "Wrong password, you can't acces that chatroom",
        );
    }
    if (!foundChatroomUser) {
      await this.chatroomUserService.createNewChatroomUser(userId, chatroomId);
    }

    this.sendToSocket(chatroom.chatroomName, ChatEventGroup.NEW_USER_CHATROOM, {
      message: `${client.nickname} has joined the group`,
      data: {},
    });

    const { id, chatroomName, type, messages } = chatroom;

    this.sendToSocket(userId, ChatEventGroup.NEW_CHATROOM, {
      message: '',
      data: { id, chatroomName, type, messages },
    });

    this.sendToSocket(userId, GeneralEvent.SUCCESS, {
      message: `Succesfully joined the group: ${chatroom.chatroomName}`,
      data: {},
    });
  }

  @SubscribeMessage(ChatEventGroup.SEND_GROUP_MESSAGE)
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

    this.sendToSocket(friendId, ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE, {
      message: '',
      data: {
        id: res.id,
        chatroomId,
        userId,
        content,
        messageTypes,
      },
    });

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

  private async isDieribaOrAdmin(
    data: RestrictedUsersDto | UnrestrictedUsersDto,
  ): Promise<RestrictedUsersDto | UnrestrictedUsersDto> {
    const { chatroomId, userId, id } = data;
    this.logger.log({ data });

    const [chatroomUser, userToRestrict] = await Promise.all([
      this.chatroomUserService.findChatroomUser(chatroomId, userId),
      this.chatroomUserService.findChatroomUser(chatroomId, id),
    ]);

    if (!chatroomUser)
      throw new WsNotFoundException(
        'You are not part of that group or that group does not exist',
      );

    if (!userToRestrict)
      throw new WsNotFoundException('User to restrict not found');

    if (
      chatroomUser.role !== ROLE.DIERIBA &&
      chatroomUser.role !== ROLE.CHAT_ADMIN
    ) {
      throw new WsBadRequestException('Unauthorized');
    }

    if (userToRestrict.user.id === userId)
      throw new WsBadRequestException('Cannot restrict myself');

    if (chatroomUser.role !== ROLE.DIERIBA) {
      if (
        userToRestrict.role === ROLE.DIERIBA ||
        userToRestrict.role === ROLE.CHAT_ADMIN
      )
        throw new WsBadRequestException('Cannot Restrict chat admin');
    }

    return {
      ...data,
      isChatAdmin: userToRestrict.role === ROLE.CHAT_ADMIN ? true : false,
    };
  }

  private async isDieriba(userId: string, chatroomId: string): Promise<void> {
    this.logger.log(`User is undefined ${userId}`);
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

    this.sendToSocket(friendId, FriendEvent.NEW_REQUEST_RECEIVED, {
      message: `You received a friend request from ${client.nickname}`,
      data: {
        friendId: client.userId,
      },
    });

    this.sendToSocket(friendId, FriendEvent.ADD_NEW_REQUEST, {
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

    this.sendToSocket(client.userId, FriendEvent.NEW_REQUEST_SENT, {
      message: '',
      data: {
        recipient: {
          nickname: friend.nickname,
          id: friend.id,
          profile: { avatar: friend.profile?.avatar },
        },
      },
    });

    this.sendToSocket(client.userId, GeneralEvent.SUCCESS, {
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

    console.log({ friendId });

    this.sendToSocket(friendId, FriendEvent.CANCEL_REQUEST, {
      message: '',
      data: { friendId: client.userId },
    });

    this.sendToSocket(client.userId, FriendEvent.CANCEL_REQUEST, {
      message: 'Friend request declined succesfully',
      data: {
        friendId,
      },
    });

    this.sendToSocket(client.userId, GeneralEvent.SUCCESS, {
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

    this.sendToSocket(friendId, FriendEvent.CANCEL_REQUEST, {
      message: '',
      data: { friendId: client.userId },
    });

    this.sendToSocket(client.userId, FriendEvent.CANCEL_REQUEST, {
      message: '',
      data: { friendId },
    });

    this.sendToSocket(friendId, FriendEvent.NEW_REQUEST_ACCEPTED, {
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

    this.sendToSocket(friendId, FriendEvent.NEW_FRIEND, {
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

    this.sendToSocket(client.userId, FriendEvent.NEW_FRIEND, {
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

    this.sendToSocket(client.userId, ChatEventPrivateRoom.NEW_CHATROOM, {
      message: '',
      data: chatroom,
    });

    this.sendToSocket(friendId, ChatEventPrivateRoom.NEW_CHATROOM, {
      message: '',
      data: chatroom,
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
    this.sendToSocket(friendId, FriendEvent.DELETE_FRIEND, {
      message: '',
      data: { friendId: client.userId },
    });
    this.sendToSocket(friendId, ChatEventPrivateRoom.CLEAR_CHATROOM, {
      message: `${client.nickname} deleted you as friend`,
      data: { chatroomId },
    });
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
          this.sendToSocket(friendId, ChatEventPrivateRoom.CLEAR_CHATROOM, {
            message: `${client.nickname} deleted you as friend`,
            data: { chatroomId: chatroom.id },
          });
        }
      });
      this.sendToSocket(friendId, FriendEvent.DELETE_FRIEND, {
        message: '',
        data: { friendId: client.userId },
      });

      this.sendToSocket(client.userId, FriendEvent.DELETE_FRIEND, {
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
      this.sendToSocket(client.userId, FriendEvent.CANCEL_REQUEST, {
        message: '',
        data: { friendId },
      });
      this.sendToSocket(friendId, FriendEvent.CANCEL_REQUEST, {
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

      this.sendToSocket(client.userId, FriendEvent.UNBLOCK_FRIEND, {
        message: '',
        data: { friendId },
      });
    }
    this.server
      .to(client.userId)
      .emit(GeneralEvent.SUCCESS, { message: 'User unblocked!' });
  }

  private sendToSocket(
    room: string,
    emit: string,
    object?: SocketServerResponse,
  ) {
    this.server.to(room).emit(emit, object);
  }
  /*------------------------------------------------------------------------------------------------------ */
}
