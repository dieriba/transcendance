import {
  CHATROOM_JOIN,
  CHATROOM_USER_JOINED,
  CHATROOM_USER_RESTRICTED,
  CHATROOM_USER_UNRESTRICTED,
} from './../../shared/socket.events';
import {
  CHATROOM_ADD_USER,
  CHATROOM_CHANGE_USER_ROLE,
  CHATROOM_CREATE,
  CHATROOM_CREATED,
  CHATROOM_DELETE_USER,
  CHATROOM_NEW_DIERIBA,
  CHATROOM_RESTRICT_USER,
  CHATROOM_SEND_MESSAGE,
  CHATROOM_SET_DIERIBA,
  CHATROOM_UNRESTRICT_USER,
  CHATROOM_USER_ADDED,
  CHATROOM_USER_DELETED,
  CHATROOM_USER_RESTRICT_CHAT_ADMIN,
  CHATROOM_USER_RESTRICT_LIFE,
  CHATROOM_USER_ROLE_CHANGED,
} from '../../shared/socket.events';
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
import { MESSAGE_TYPES, ROLE, TYPE } from '@prisma/client';
import { Namespace } from 'socket.io';
import { Argon2Service } from 'src/argon2/argon2.service';
import { SocketWithAuth } from 'src/auth/type';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import {
  WsBadRequestException,
  WsNotFoundException,
  WsUnauthorizedException,
  WsUnknownException,
} from 'src/common/custom-exception/ws-exception';
import { WsCatchAllFilter } from 'src/common/global-filters/ws-exception-filter';
import { ChatroomBaseData } from 'src/common/types/chatroom-info-type';
import { ChatroomUserInfo } from 'src/common/types/chatroom-user-type';
import { UserData, UserId } from 'src/common/types/user-info.type';
import { GatewayService } from 'src/gateway/gateway.service';
import { LibService } from 'src/lib/lib.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import {
  ChatRoomDto,
  ChatroomDataDto,
  DieribaDto,
  ChangeUserRoleDto,
  RestrictedUsersDto,
  UnrestrictedUsersDto,
  JoinChatroomDto,
  ChatroomMessageDto,
  DmMessageDto,
} from './dto/chatroom.dto';
import { BAD_REQUEST } from 'src/common/constant/http-error.constant';
import { CheckGroupCreationValidity } from './pipes/check-group-creation-validity.pipe';
import { IsDieriba } from './pipes/is-dieriba.pipe';
import { isDieribaOrAdmin } from './pipes/is-dieriba-or-admin.pipe';
import { IsExistingUserAndGroup } from './pipes/is-existing-goup.pipe';
import { WsAccessTokenGuard } from 'src/common/guards/ws.guard';
import { ChatRoute } from 'src/common/custom-decorator/metadata.decorator';

@UseGuards(WsAccessTokenGuard)
@UseFilters(WsCatchAllFilter)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway({
  namespace: 'chats',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatroomService: ChatroomService,
    private readonly chatroomUserService: ChatroomUserService,
    private readonly argon2Service: Argon2Service,
    private readonly libService: LibService,
  ) {}

  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Namespace;

  handleConnection(client: SocketWithAuth) {
    const sockets = this.server.sockets;

    this.logger.log(
      `WS client with id: ${client.id} and userId : ${client.userId} connected!`,
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
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.log(
      `Size of socket map ${this.gatewayService.getSockets().size}`,
    );
  }

  @SubscribeMessage(CHATROOM_CREATE)
  async createChatRoom(
    @MessageBody(CheckGroupCreationValidity) chatroomDto: ChatRoomDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
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

    users.push(userId);

    this.logger.log({ users });

    const existingUserId = await this.userService.getExistingUserNonBlocked(
      userId,
      users,
      UserId,
    );

    this.logger.log({ existingUserId });
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
        users: true,
      },
    });

    this.logger.log('New chatroom created and users linked:', newChatroom);
    this.server.emit(CHATROOM_CREATED, newChatroom);
  }

  @SubscribeMessage(CHATROOM_ADD_USER)
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
      await this.userService.getExistingUserNonBlocked(userId, users, UserData);

    this.logger.log({ existingUserAndNonBlocked });
    const newUsers = await this.prismaService.$transaction(
      existingUserAndNonBlocked.map((userId) =>
        this.chatroomUserService.createNewChatroomUser(userId, chatroomId),
      ),
    );
    this.server.emit(CHATROOM_USER_ADDED, newUsers);
  }

  @SubscribeMessage(CHATROOM_SET_DIERIBA)
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

    this.server.emit(CHATROOM_NEW_DIERIBA, { updateMe, updateNewDieriba });
  }

  @SubscribeMessage(CHATROOM_DELETE_USER)
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

    this.server.emit(CHATROOM_USER_DELETED, deletedUsers);
  }

  @SubscribeMessage(CHATROOM_CHANGE_USER_ROLE)
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
      await this.userService.getExistingUserNonBlocked(
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

    this.server.emit(CHATROOM_USER_ROLE_CHANGED, updatedChatroomsUser);
  }

  @SubscribeMessage(CHATROOM_RESTRICT_USER)
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
      this.server.emit(CHATROOM_USER_RESTRICT_LIFE, data);
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
      this.server.emit(CHATROOM_USER_RESTRICT_CHAT_ADMIN, data);
    } else {
      const data = await restrictedUser;
      this.server.emit(CHATROOM_USER_RESTRICTED, data);
    }
  }

  @SubscribeMessage(CHATROOM_UNRESTRICT_USER)
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
    this.server.emit(CHATROOM_USER_UNRESTRICTED, data);
  }

  @SubscribeMessage(CHATROOM_JOIN)
  //@UseGuards(IsRestrictedUserGuard)
  async joinChatroom(
    @MessageBody() joinChatroomDto: JoinChatroomDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { chatroomId } = joinChatroomDto;
    const { userId } = client;
    this.logger.log(`password: [${joinChatroomDto.password}]`);

    const chatroom = await this.chatroomService.findChatroom(
      chatroomId,
      ChatroomBaseData,
    );

    if (!chatroom) throw new WsUnknownException('Chatroom not found');

    this.logger.log({ chatroom });

    const foundChatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    this.logger.log({ foundChatroomUser });

    if (chatroom.type !== TYPE.PUBLIC) {
      if (chatroom.type === TYPE.PRIVATE && !foundChatroomUser) {
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

        if (!foundChatroomUser) {
          await this.chatroomUserService.createNewChatroomUser(
            userId,
            chatroomId,
          );
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = chatroom;

    this.server.emit(
      CHATROOM_USER_JOINED,
      `${foundChatroomUser.user.nickname} joined the room`,
    );
  }

  @SubscribeMessage(CHATROOM_SEND_MESSAGE)
  @ChatRoute()
  async sendMessageToChatroom(
    @MessageBody(IsExistingUserAndGroup) chatroomMessageDto: ChatroomMessageDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { userId } = client;
    const updatedChatrooms = await this.prismaService.chatroom.update({
      where: {
        id: chatroomMessageDto.chatroomId,
      },
      data: {
        messages: {
          create: {
            content: chatroomMessageDto.content,
            imageUrl: null,
            messageTypes: MESSAGE_TYPES.TEXT,
            userId,
          },
        },
      },
    });

    return updatedChatrooms;
  }

  @SubscribeMessage('private.chat.send.message')
  async sendDmToPenfriend(
    senderId: string,
    message: DmMessageDto,
    select: ChatroomUserInfo,
  ) {
    const { recipientId, content } = message;

    const chatroom = await this.chatroomUserService.findChatroomUserDm(
      senderId,
      recipientId,
      select,
    );
    if (!chatroom) return await this.createChatroomDm(senderId, message);

    return await this.prismaService.chatroom.update({
      where: {
        id: chatroom.chatroomId,
      },
      data: {
        messages: {
          create: {
            content: content,
            imageUrl: null,
            messageTypes: MESSAGE_TYPES.TEXT,
            user: {
              connect: {
                id: senderId,
              },
            },
          },
        },
      },
    });
  }

  private async createChatroomDm(
    senderId: string,
    { recipientId, content }: DmMessageDto,
  ) {
    return await this.prismaService.chatroom.create({
      data: {
        type: TYPE.DM,
        users: {
          create: [
            {
              userId: senderId,
              penFriend: recipientId,
            },
            {
              userId: recipientId,
              penFriend: senderId,
            },
          ],
        },
        messages: {
          create: [
            {
              content: content,
              imageUrl: null,
              messageTypes: MESSAGE_TYPES.TEXT,
              user: {
                connect: {
                  id: senderId,
                },
              },
            },
          ],
        },
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
}
