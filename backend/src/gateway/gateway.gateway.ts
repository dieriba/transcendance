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
import { ROLE, TYPE, MESSAGE_TYPES } from '@prisma/client';
import { ChatEventPrivateRoom, FriendEvent } from '@shared/socket.event';
import { Namespace, Server } from 'socket.io';
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
} from 'src/chat/dto/chatroom.dto';
import { isDieribaOrAdmin } from 'src/chat/pipes/is-dieriba-or-admin.pipe';
import { IsDieriba } from 'src/chat/pipes/is-dieriba.pipe';
import { IsExistingUserAndGroup } from 'src/chat/pipes/is-existing-goup.pipe';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { BAD_REQUEST } from 'src/common/constant/http-error.constant';
import { ChatRoute } from 'src/common/custom-decorator/metadata.decorator';
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
import { UserData } from 'src/common/types/user-info.type';
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
  }

  handleDisconnect(client: SocketWithAuth) {
    const { sockets } = this.server.sockets;

    this.logger.log(`WS client with id: ${client.id} disconnected!`);
    this.logger.log(`Socket data: `, sockets);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.log(
      `Size of socket map ${this.gatewayService.getSockets().size}`,
    );
  }

  /*@SubscribeMessage(ChatEvent.CREATE_GROUP_CHATROOM)
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
    //this.server.emit(CHATROOM_CREATED, newChatroom);
  }*/

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
      await this.userService.getExistingUserNonBlocked(userId, users, UserData);

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

  //@SubscribeMessage(CHATROOM_JOIN)
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

    /*this.server.emit(
      CHATROOM_USER_JOINED,
      `${foundChatroomUser.user.nickname} joined the room`,
    );*/
  }

  //@SubscribeMessage(CHATROOM_SEND_MESSAGE)
  @ChatRoute()
  async sendMessageToChatroom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody(IsExistingUserAndGroup) chatroomMessageDto: ChatroomMessageDto,
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

    const res = await this.prismaService.message.create({
      data: {
        content: content,
        imageUrl: image,
        messageTypes,
        //add reply props
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
      client,
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

    client.emit(ChatEventPrivateRoom.RECEIVE_PRIVATE_MESSAGE, {
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

    this.sendToSocket(client, friendId, FriendEvent.NEW_REQUEST_RECEIVED, {
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

    client.emit(FriendEvent.NEW_REQUEST_SENT, {
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

    const res = await this.prismaService.$transaction([
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
        select: {
          id: true,
          users: {
            select: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  status: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
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

    client.emit(FriendEvent.NEW_CHATROOM, {
      message: '',
      data: res[1],
    });

    console.log(res[1]);

    this.sendToSocket(client, friendId, FriendEvent.NEW_CHATROOM, {
      message: '',
      data: res[1],
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
  /*------------------------------------------------------------------------------------------------------ */
}