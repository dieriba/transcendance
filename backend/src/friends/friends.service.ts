import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendsType } from './types/friends.type';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { REQUEST_STATUS } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}
  private readonly logger = new Logger(FriendsService.name);

  async sendFriendRequest(body: FriendsType) {
    const { userId, id } = body;

    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      id,
    );

    if (existingBlockedUser) {
      const { blockedBy, blockedUsers } = existingBlockedUser;

      if (blockedBy.length && blockedBy.length)
        throw new CustomException(
          'You both blocked each other',
          HttpStatus.BAD_REQUEST,
        );
      else if (blockedUsers.length > 0)
        throw new CustomException(
          'Cannot add a user that you have blocked',
          HttpStatus.BAD_REQUEST,
        );
      else if (blockedBy.length > 0)
        throw new CustomException(
          'Cannot add a user that have blocked you',
          HttpStatus.BAD_REQUEST,
        );
    }
    const existingFriendShip = await this.isFriends(userId, id);

    if (existingFriendShip)
      throw new BadRequestException('You are already friend with that user');

    const existingFriendRequest = await this.isAlreadyFriendsRequestSent(
      userId,
      id,
    );

    this.logger.log({ existingFriendRequest });

    if (existingFriendRequest) {
      if (existingFriendRequest.senderId != userId)
        throw new BadRequestException(
          'That user already send you a friend request',
        );
      else
        throw new BadRequestException(
          'That user already send you a friend request',
        );
    }

    await this.prismaService.friendRequest.create({
      data: {
        sender: {
          connect: {
            id: userId,
          },
        },
        recipient: {
          connect: {
            id,
          },
        },
      },
    });
  }

  async cancelFriendRequest(body: FriendsType) {
    const { userId, id } = body;

    const existingFriendRequest = await this.isRequestBetweenUser(userId, id);

    if (!existingFriendRequest)
      throw new BadRequestException(
        'That user did not send you a friend request',
      );

    const existingFriendship = await this.isFriends(userId, id);

    if (existingFriendship)
      throw new BadRequestException('You are friends with that user');

    await this.prismaService.friendRequest.delete({
      where: {
        senderId_recipientId: {
          senderId: existingFriendRequest.senderId,
          recipientId: existingFriendRequest.recipientId,
        },
      },
    });
  }

  async acceptFriend(body: FriendsType) {
    const { userId, id } = body;

    const existingFriendship = await this.isFriends(userId, id);
    this.logger.log({ existingFriendship });

    if (existingFriendship)
      throw new CustomException(
        'You are already friends with that user',
        HttpStatus.BAD_REQUEST,
      );

    const existingFriendRequest = await this.hasUserSentMeARequest(id, userId);

    if (!existingFriendRequest)
      throw new CustomException(
        'User has not send you a friend request',
        HttpStatus.BAD_REQUEST,
      );

    /*MAYBE CHECK IF USER HAS BLOCKED ME*/

    await this.prismaService.$transaction([
      this.prismaService.friendRequest.update({
        where: {
          senderId_recipientId: {
            senderId: existingFriendRequest.senderId,
            recipientId: existingFriendRequest.recipientId,
          },
        },
        data: {
          status: REQUEST_STATUS.ACCEPTED,
        },
      }),
      this.prismaService.friends.create({
        data: {
          user: { connect: { id: userId } },
          friend: { connect: { id: id } },
        },
      }),
      this.prismaService.friends.create({
        data: {
          user: { connect: { id } },
          friend: { connect: { id: userId } },
        },
      }),
    ]);
  }

  async deleteFriends(body: FriendsType) {
    const { userId, id } = body;

    const existingFriendship = await this.isFriends(userId, id);

    if (!existingFriendship)
      throw new CustomException(
        'You cannot delete user that are not your friend with',
        HttpStatus.BAD_REQUEST,
      );

    await this.prismaService.$transaction([
      this.prismaService.friendRequest.delete({
        where: {
          senderId_recipientId: {
            senderId: userId,
            recipientId: id,
          },
          OR: [{ senderId: id, recipientId: userId }],
        },
      }),
      this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          friends: {
            disconnect: {
              userId_friendId: {
                userId: userId,
                friendId: id,
              },
            },
          },
        },
      }),
      this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          friends: {
            disconnect: {
              userId_friendId: {
                userId: id,
                friendId: userId,
              },
            },
          },
        },
      }),
    ]);
  }

  async blockUser(body: FriendsType) {
    const { userId, id } = body;

    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      id,
    );

    if (existingBlockedUser && existingBlockedUser.blockedUsers.length > 0)
      throw new CustomException('User already blocked', HttpStatus.BAD_REQUEST);

    const existingFriendShip = await this.isFriends(userId, id);

    this.logger.log({ existingFriendShip });

    const existingFriendRequest = await this.isRequestBetweenUser(userId, id);
    if (existingFriendShip) {
      await this.prismaService.$transaction([
        this.prismaService.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: id } } },
        }),
        this.prismaService.friendRequest.delete({
          where: {
            senderId_recipientId: {
              senderId: existingFriendRequest.senderId,
              recipientId: existingFriendRequest.recipientId,
            },
          },
        }),
        this.prismaService.friends.delete({
          where: {
            userId_friendId: {
              userId,
              friendId: id,
            },
          },
        }),
        this.prismaService.friends.delete({
          where: {
            userId_friendId: {
              userId: id,
              friendId: userId,
            },
          },
        }),
      ]);
    } else if (existingFriendRequest) {
      await this.prismaService.$transaction([
        this.prismaService.user.update({
          where: { id: userId },
          data: { blockedUsers: { connect: { id: id } } },
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
    } else {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { blockedUsers: { connect: { id } } },
      });
    }
  }

  async unblockUser(body: FriendsType) {
    const { userId, id } = body;
    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      id,
    );
    if (existingBlockedUser && existingBlockedUser.blockedUsers.length > 0) {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { blockedUsers: { disconnect: { id: id } } },
      });
    }
  }

  private async isFriends(senderId: string, recipientId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: senderId,
        friends: {
          some: {
            friendId: recipientId,
          },
        },
      },
      include: {
        friendUserFriends: {
          where: {
            friendId: recipientId,
          },
        },
        friendRequestsReceived: {
          where: {
            senderId: recipientId,
          },
        },
        friendRequestsSent: {
          where: {
            senderId,
          },
        },
      },
    });
    return user;
  }

  private async isAlreadyFriendsRequestSent(
    senderId: string,
    recipientId: string,
  ) {
    const user = await this.prismaService.friendRequest.findFirst({
      where: {
        OR: [
          {
            senderId,
            recipientId,
          },
          {
            senderId: recipientId,
            recipientId: senderId,
          },
        ],
      },
    });

    return user;
  }

  private async hasUserSentMeARequest(senderId: string, recipientId: string) {
    const user = await this.prismaService.friendRequest.findUnique({
      where: {
        senderId_recipientId: {
          senderId,
          recipientId,
        },
      },
    });

    return user;
  }

  private async isRequestBetweenUser(senderId: string, recipientId: string) {
    const user = await this.prismaService.friendRequest.findFirst({
      where: {
        OR: [
          {
            senderId,
            recipientId,
          },
          {
            senderId: recipientId,
            recipientId: senderId,
          },
        ],
      },
    });

    return user;
  }
}
