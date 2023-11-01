import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendsType } from './types/friends.type';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { FriendsTypeDto } from './dto/friends.dto';
import { UserData, UserFriendRequest } from 'src/common/types/user-info.type';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';

@Injectable()
export class FriendsService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}
  private readonly logger = new Logger(FriendsService.name);

  async getAllReceivedFriendsRequest(userId: string) {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();

    const request = this.prismaService.friendRequest.findMany({
      where: {
        recipientId: userId,
      },
      select: {
        sender: {
          select: {
            nickname: true,
            id: true,
          },
        },
        createdAt: true,
      },
    });

    return request;
  }

  async getAllSentFriendRequest(userId: string) {
    const user = await this.userService.findUserById(userId, UserFriendRequest);

    if (!user) throw new UserNotFoundException();

    const request = this.prismaService.friendRequest.findMany({
      where: {
        senderId: userId,
      },
      select: {
        recipient: {
          select: {
            nickname: true,
            id: true,
          },
        },
        createdAt: true,
      },
    });

    return request;
  }

  async getFriendDetails(body: FriendsTypeDto) {
    const { userId, friendId } = body;
    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      friendId,
    );

    if (existingBlockedUser) {
      if (existingBlockedUser.blockedUsers.length > 0)
        throw new CustomException(
          'Cannot access details of a user you blocked',
          HttpStatus.BAD_REQUEST,
        );
      else if (existingBlockedUser.blockedBy.length > 0)
        throw new CustomException(
          'Cannot access details of a user that has blocked you',
          HttpStatus.BAD_REQUEST,
        );
    }

    const friend = await this.prismaService.user.findFirst({
      where: { id: friendId },
    });

    return friend;
  }

  async unblockUser(body: FriendsType) {
    const { userId, friendId } = body;
    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      friendId,
    );
    if (existingBlockedUser && existingBlockedUser.blockedUsers.length > 0) {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { blockedUsers: { disconnect: { id: friendId } } },
      });
    }
  }

  public async isFriends(senderId: string, recipientId: string) {
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

  public async isAlreadyFriendsRequestSent(
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

  public async hasUserSentMeARequest(senderId: string, recipientId: string) {
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

  public async isRequestBetweenUser(senderId: string, recipientId: string) {
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
      include: {
        sender: true,
        recipient: true,
      },
    });

    return user;
  }
}
