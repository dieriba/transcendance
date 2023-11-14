import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from './../user/user.service';
import { ChatroomDataDto } from './dto/chatroom.dto';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RESTRICTION, ROLE, TYPE } from '@prisma/client';
import { UserData } from 'src/common/types/user-info.type';
import { ChatroomUserBaseData } from 'src/common/types/chatroom-user-type';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatroomUserService: ChatroomUserService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async getUserChatroom(userId: string) {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();

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

    return chatrooms;
  }

  async getJoinableChatroom(userId: string) {
    console.log({ userId });

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
                  in: [RESTRICTION.BANNED, RESTRICTION.KICKED],
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
    if (!chatroomId) throw new BadRequestException('Bad Request');

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
      },
      select: {
        users: {
          orderBy: {
            user: {
              nickname: 'asc',
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
                restrictedGroups: {
                  where: {
                    chatroomId,
                    restrictionTimeEnd: {
                      gt: new Date(),
                    },
                  },
                  select: {
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
                    reason: true,
                    restriction: true,
                    restrictionTimeStart: true,
                    restrictionTimeEnd: true,
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

    let userRole: ROLE;

    const users = chatroom.users.filter(({ user, role }) => {
      if (user.id === userId) userRole = role;

      return (
        user.restrictedGroups.length === 0 ||
        user.restrictedGroups[0].restriction === RESTRICTION.MUTED
      );
    });

    this.logger.log({
      user: userRole === ROLE.REGULAR_USER ? users : chatroom.users,
    });

    return {
      users,
      role: userRole,
    };
  }

  async getAllRestrictedUser(userId: string, chatroomId: string) {
    const restrictedUser = await this.prismaService.restrictedUser.findMany({
      where: {
        chatroomId,
        restrictionTimeEnd: {
          gt: new Date(),
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
            restrictedGroups: {
              select: {
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
                reason: true,
                restriction: true,
                restrictionTimeStart: true,
                restrictionTimeEnd: true,
              },
            },
          },
        },
      },
    });

    console.log({ restrictedUser });

    return restrictedUser;
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

  async findAllUsersChat(userId: string) {
    return await this.userService.findUsersAndHisChatroom(
      userId,
      ChatroomUserBaseData,
    );
  }
}
