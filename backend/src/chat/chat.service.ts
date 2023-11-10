import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from './../user/user.service';
import {
  ChangeUserRoleDto,
  ChatRoomDto,
  ChatroomDataDto,
  ChatroomMessageDto,
  DieribaDto,
  JoinChatroomDto,
  RestrictedUsersDto,
  UnrestrictedUsersDto,
} from './dto/chatroom.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MESSAGE_TYPES, RESTRICTION, ROLE, TYPE } from '@prisma/client';
import { Argon2Service } from 'src/argon2/argon2.service';
import { UserData, UserId } from 'src/common/types/user-info.type';
import { ChatroomUserBaseData } from 'src/common/types/chatroom-user-type';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { ChatRoomNotFoundException } from './exception/chatroom-not-found.exception';
import { LibService } from 'src/lib/lib.service';
import { BAD_REQUEST } from 'src/common/constant/http-error.constant';
import { ChatroomBaseData } from 'src/common/types/chatroom-info-type';
import { WsNotFoundException } from 'src/common/custom-exception/ws-exception';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatroomService: ChatroomService,
    private readonly chatroomUserService: ChatroomUserService,
    private readonly argon2Service: Argon2Service,
    private readonly libService: LibService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async getUserChatroom(userId: string) {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();
    console.log('entered');

    const chatrooms = await this.prismaService.chatroom.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
        type: TYPE.DM,
        active: true,
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
          select: {
            id: true,
            chatroomId: true,
            userId: true,
            content: true,
            messageTypes: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    console.log({ chatrooms });

    return chatrooms;
  }

  async getJoinableChatroom(userId: string) {
    const joinableChatroom = await this.prismaService.chatroom.findMany({
      where: {
        type: {
          notIn: [TYPE.DM, TYPE.PRIVATE],
        },
        users: {
          none: {
            userId,
          },
        },
        restrictedUsers: {
          none: {
            AND: [
              { userId },
              {
                restriction: {
                  notIn: [RESTRICTION.BANNED, RESTRICTION.KICKED],
                },
              },
              {
                restrictionTimeEnd: {
                  lt: new Date(),
                },
              },
            ],
          },
        },
      },
      select: {
        id: true,
        chatroomName: true,
        type: true,
      },
    });

    return joinableChatroom;
  }

  async getAllUserChatroom(userId: string, chatroomId: string) {
    const chatroomUser = await this.prismaService.chatroomUser.findFirst({
      where: {
        chatroomId,
        userId,
      },
    });

    if (!chatroomUser)
      throw new CustomException(
        'Cannot get user of a room you do not belong in',
        HttpStatus.FORBIDDEN,
      );

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
      },
      select: {
        users: {
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
            role: true,
          },
        },
      },
    });

    if (!chatroom)
      throw new CustomException(
        'chatroom does not exist',
        HttpStatus.NOT_FOUND,
      );

    return chatroom.users;
  }

  async getAllChatroomMessage(userId: string, chatroomId: string) {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
      },
      select: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            content: true,
            userId: true,
            chatroomId: true,
            messageTypes: true,
          },
        },
      },
    });

    if (!chatroom) throw new WsNotFoundException('Chat does not exist');

    return chatroom.messages;
  }

  async createChatRoom(creatorId: string, chatroomDto: ChatRoomDto) {
    const { users, ...chatroom } = chatroomDto;
    const { chatroomName } = chatroom;
    const user = await this.userService.findUserById(creatorId, UserData);

    if (!user) throw new UserNotFoundException();

    this.logger.log(
      `Attempting to create the chatroom: ${chatroomName} who will be owned by ${user.nickname}`,
    );

    const chatRoom = await this.prismaService.chatroom.findFirst({
      where: { chatroomName },
    });

    if (chatRoom)
      throw new CustomException(
        `The chatroom name: ${chatroomName} is already taken`,
        HttpStatus.BAD_REQUEST,
      );

    users.push(creatorId);

    this.logger.log({ users });

    const existingUserId = await this.userService.getExistingUserFriend(
      creatorId,
      users,
      UserId,
    );

    this.logger.log({ existingUserId });

    this.logger.log({ existingUserId });

    const newChatroom = await this.prismaService.chatroom.create({
      data: {
        ...chatroom,
        users: {
          create: existingUserId.map((id) => ({
            user: {
              connect: { id },
            },
            role: creatorId === id ? ROLE.DIERIBA : ROLE.REGULAR_USER,
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
    return newChatroom;
  }

  async addNewUserToChatroom(userId: string, chatRoomData: ChatroomDataDto) {
    const { users, chatroomId } = chatRoomData;
    this.logger.log({ chatroomId, users });

    const existingUserAndNonBlocked =
      await this.userService.getExistingUserFriend(userId, users, UserData);

    this.logger.log({ existingUserAndNonBlocked });
    const newUsers = await this.prismaService.$transaction(
      existingUserAndNonBlocked.map((userId) =>
        this.chatroomUserService.createNewChatroomUser(userId, chatroomId),
      ),
    );
    return newUsers;
  }

  async setNewChatroomDieriba(dieribaDto: DieribaDto) {
    const { id, userId, chatroomId } = dieribaDto;

    if (id === userId)
      throw new CustomException(
        'You already are the DIERIBA of that chatroom',
        HttpStatus.BAD_REQUEST,
      );

    const [chatroomUser, restrictedUser] = await Promise.all([
      this.chatroomUserService.findChatroomUser(chatroomId, id),
      this.prismaService.restrictedUser.findFirst({ where: { userId: id } }),
    ]);

    this.logger.log({ chatroomUser, id, userId, restrictedUser });

    if (!chatroomUser) throw new UserNotFoundException();

    const now = new Date();

    if (restrictedUser && restrictedUser.restrictionTimeEnd > now)
      throw new CustomException(
        "Can't set as DIERIBA someone that is currently on a restriction, please remove the restriction first",
        HttpStatus.BAD_REQUEST,
      );

    if (chatroomUser.user.blockedUsers.length)
      throw new CustomException(
        "That user blocked you, hence you can't set him as Chat owner",
        HttpStatus.BAD_REQUEST,
      );
    else if (chatroomUser.user.blockedBy.length)
      throw new CustomException(
        "You blocked that user, hence you can't set him as Chat owner",
        HttpStatus.BAD_REQUEST,
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

    return { updateMe, updateNewDieriba };
  }

  async deleteUserFromChatromm(chatroomData: ChatroomDataDto) {
    const { users, chatroomId, userId } = chatroomData;

    const creator = users.find((user) => user == userId);

    if (creator)
      throw new CustomException(
        'Cannot delete the group owner of that room',
        HttpStatus.BAD_REQUEST,
      );

    const deletedUsers = await this.prismaService.chatroomUser.deleteMany({
      where: {
        chatroomId: chatroomId,
        userId: {
          in: users,
        },
      },
    });

    return deletedUsers;
  }

  async changeUserRole(changeUserRoleDto: ChangeUserRoleDto) {
    const { users, chatroomId, userId } = changeUserRoleDto;

    const idSet = new Set(users.map((user) => user.id));

    if (idSet.size !== users.length)
      throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);

    const foundUser = new Set(
      await this.userService.getExistingUserFriend(
        userId,
        users.map((user) => user.id),
        UserData,
      ),
    );

    if (foundUser.size === 0)
      throw new CustomException(
        'None of the given user exist',
        HttpStatus.NOT_FOUND,
      );

    const existingUsers = users.filter((user) => idSet.has(user.id));

    const chatroom = await this.prismaService.chatroom.findUnique({
      where: { id: chatroomId },
    });

    if (!chatroom) throw new ChatRoomNotFoundException();

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

    return updatedChatroomsUser;
  }

  async restrictUser(restrictedUserDto: RestrictedUsersDto) {
    const date = new Date();

    const {
      chatroomId,
      id,
      duration,
      restriction,
      durationUnit,
      userId,
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

      return await this.prismaService.$transaction([
        restrictedUser,
        deletedUser,
      ]);
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
      return await this.prismaService.$transaction([restrictedUser, oldAdmin]);
    } else {
      return await restrictedUser;
    }
  }

  async unrestrictUser(unrestrictedUserDto: UnrestrictedUsersDto) {
    const { chatroomId, id, isChatAdmin, userId } = unrestrictedUserDto;

    const unrestrictedUser = await this.prismaService.restrictedUser.findFirst({
      where: { userId: id },
    });

    if (!unrestrictedUser)
      throw new CustomException(
        "The user either don't exist or have not been restricted",
        HttpStatus.NOT_FOUND,
      );

    if (isChatAdmin && userId !== unrestrictedUser.adminId) {
      throw new CustomException(
        'Only Dieriba or admin who restricted that use can unrestrict him',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.prismaService.restrictedUser.delete({
      where: {
        userId_chatroomId: {
          userId: id,
          chatroomId,
        },
      },
    });
  }

  async joinChatroom(userId: string, joinChatroomDto: JoinChatroomDto) {
    const { chatroomId } = joinChatroomDto;

    this.logger.log(`password: [${joinChatroomDto.password}]`);

    const chatroom = await this.chatroomService.findChatroom(
      chatroomId,
      ChatroomBaseData,
    );

    if (!chatroom) throw new ChatRoomNotFoundException();

    this.logger.log({ chatroom });

    const foundChatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    this.logger.log({ foundChatroomUser });

    if (chatroom.type !== TYPE.PUBLIC) {
      if (chatroom.type === TYPE.PRIVATE && !foundChatroomUser) {
        throw new CustomException(
          "You can't join that private chatroom, you need to be invited first",
          HttpStatus.UNAUTHORIZED,
        );
      } else if (chatroom.type === TYPE.PROTECTED) {
        const match = await this.argon2Service.compare(
          chatroom.password,
          joinChatroomDto.password,
        );

        if (!match)
          throw new CustomException(
            "Wrong password, you can't acces that chatroom",
            HttpStatus.UNAUTHORIZED,
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

    return data;
  }

  async findAllUsersChat(userId: string) {
    return await this.userService.findUsersAndHisChatroom(
      userId,
      ChatroomUserBaseData,
    );
  }

  async sendMessageToChatroom({
    userId,
    chatroomId,
    content,
  }: ChatroomMessageDto) {
    const updatedChatrooms = await this.prismaService.chatroom.update({
      where: {
        id: chatroomId,
      },
      data: {
        messages: {
          create: {
            content: content,
            messageTypes: MESSAGE_TYPES.TEXT,
            imageUrl: null,
            userId,
          },
        },
      },
    });

    return updatedChatrooms;
  }

  /*async sendDmToPenfriend(
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
  }*/

  /* private async createChatroomDm(
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
  }*/
}
