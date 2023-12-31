import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from './../user/user.service';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RESTRICTION, ROLE, TYPE } from '@prisma/client';
import { UserData } from 'src/common/types/user-info.type';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { ChatroomIdWithUserIdDto } from './dto/chatroom.dto';
import { ChatRoomNotFoundException } from './exception/chatroom-not-found.exception';
import { FORBIDDEN } from 'src/common/constant/http-error.constant';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
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
                    lastname: true,
                    firstname: true,
                  },
                },
                pong: true,
                friends: {
                  where: {
                    friendId: userId,
                  },
                  select: {
                    friendId: true,
                  },
                },
                friendRequestsReceived: {
                  where: {
                    senderId: userId,
                  },
                  select: {
                    recipientId: true,
                  },
                },
                friendRequestsSent: {
                  where: {
                    recipientId: userId,
                  },
                  select: {
                    senderId: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
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
      orderBy: {
        updatedAt: 'asc',
      },
    });

    return chatrooms;
  }

  async getAllChatableUsers(userId: string) {
    const chatableUsers = await this.prismaService.user.findMany({
      where: {
        id: { not: userId },
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
      select: {
        id: true,
        nickname: true,
        profile: { select: { avatar: true } },
      },
    });

    return chatableUsers;
  }

  async getAllChatroomMessage(userId: string, chatroomId: string) {
    if (!chatroomId) throw new BadRequestException('Bad Request');

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UserNotFoundException();

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: {
        id: chatroomId,
        type: TYPE.DM,
        users: {
          some: {
            userId,
          },
        },
      },
      select: {
        messages: {
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

    if (!chatroom)
      throw new CustomException(
        'Chatroom not found or user do not belong to that chatroom',
        HttpStatus.BAD_REQUEST,
      );

    return chatroom.messages;
  }

  async getJoinableChatroom(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UserNotFoundException();

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
        invitedUser: {
          none: {
            userId,
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

  async getAllGroupInvitation(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        groupInvitation: {
          select: {
            chatroom: {
              select: {
                chatroomName: true,
                id: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new UserNotFoundException();

    return user.groupInvitation;
  }

  async getAllInvitedUser(userId: string, chatroomId: string) {
    if (!chatroomId)
      throw new CustomException('Bad request', HttpStatus.BAD_REQUEST);

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UserNotFoundException();

    const chatroom = await this.prismaService.chatroom.findFirst({
      where: { id: chatroomId },
      select: {
        invitedUser: {
          select: {
            user: {
              select: {
                id: true,
                nickname: true,
                profile: { select: { avatar: true } },
              },
            },
          },
        },
      },
    });

    if (!chatroom)
      throw new CustomException('Chatroom not found', HttpStatus.NOT_FOUND);

    return chatroom.invitedUser;
  }

  async getAllUserInChatroom(userId: string, chatroomId: string) {
    if (!chatroomId) throw new BadRequestException('Bad Request');

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UserNotFoundException();

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
                    lastname: true,
                    firstname: true,
                  },
                },
                pong: {
                  select: {
                    victory: true,
                    losses: true,
                    rating: true,
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
                friendRequestsReceived: {
                  select: {
                    senderId: true,
                  },
                  where: {
                    senderId: userId,
                  },
                },
                friendRequestsSent: {
                  select: {
                    recipientId: true,
                  },
                  where: {
                    recipientId: userId,
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
                    banLife: true,
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

    return {
      users,
      role: userRole,
    };
  }

  async getAllRestrictedUser(userId: string, chatroomId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UserNotFoundException();
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

    return restrictedUser;
  }

  async getRestrictionDetatil(
    userId: string,
    chatroomIdWithUserIdDto: ChatroomIdWithUserIdDto,
  ) {
    const { id, chatroomId } = chatroomIdWithUserIdDto;
    const [me, restrictedUser] = await Promise.all([
      this.prismaService.user.findFirst({
        where: { id: userId },
        select: {
          chatrooms: {
            where: {
              chatroomId,
            },
            select: {
              role: true,
            },
          },
        },
      }),
      this.prismaService.user.findFirst({
        where: { id },
        select: {
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
              restrictionTimeEnd: true,
              restrictionTimeStart: true,
            },
          },
        },
      }),
    ]);

    if (!me || !restrictedUser) throw new UserNotFoundException();

    if (me.chatrooms.length === 0) throw new ChatRoomNotFoundException();

    const chatroomUser = me.chatrooms[0];

    if (chatroomUser.role === ROLE.REGULAR_USER)
      throw new CustomException(FORBIDDEN, HttpStatus.FORBIDDEN);

    if (restrictedUser.restrictedGroups.length === 0)
      throw new CustomException(
        'User is not restricted',
        HttpStatus.BAD_REQUEST,
      );

    return restrictedUser.restrictedGroups[0];
  }
}
