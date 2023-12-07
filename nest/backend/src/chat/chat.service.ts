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
import { LibService } from 'src/lib/lib.service';
import { WsBadRequestException } from 'src/common/custom-exception/ws-exception';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly libService: LibService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async getUserChatroom(userId: string) {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();

    const chatrooms = await this.prismaService.chatroom.findMany({
      where: {
        AND: [
          {
            users: {
              some: {
                userId,
              },
            },
            type: TYPE.DM,
            active: true,
          },
          {
            OR: [
              {
                users: {
                  some: {
                    user: {
                      friends: {
                        some: { friendId: userId },
                      },
                    },
                  },
                },
              },
              {
                messages: { some: {} },
              },
            ],
          },
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
            userId: true,
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

  async createNewPrivateChatroom(userId: string, id: string) {
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
          },
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
            take: 1,
          },
        },
      }),
    ]);

    if (!me || !user) throw new UserNotFoundException();

    if (me.blockedUsers.length > 0) {
      throw new CustomException(
        "You can't create a conversation with user, you blocked",
        HttpStatus.FORBIDDEN,
      );
    }

    if (me.blockedBy.length > 0) {
      throw new CustomException(
        "You can't create a conversation with user that blocked you",
        HttpStatus.FORBIDDEN,
      );
    }

    if (chatroom) {
      const { active, ...data } = chatroom;
      if (!active) {
        await this.prismaService.chatroom.update({
          where: { id: chatroom.id },
          data: { active: true },
        });
      }
      return data;
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
                pong: true,
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
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
        },
      },
    });

    return newChatroom;
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

  async getAllUserChatroom(userId: string, chatroomId: string) {
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
}
