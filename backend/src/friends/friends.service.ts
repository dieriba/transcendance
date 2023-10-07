import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendsType } from './types/friends.type';

@Injectable()
export class FriendsService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}
  private logger = new Logger(FriendsService.name);

  async blockUser(body: FriendsType) {
    const { userId, id } = body;

    const existingBlockedUser = await this.userService.findBlockedUser(
      userId,
      id,
    );
    if (existingBlockedUser && existingBlockedUser.blockedUsers.length > 0)
      return { message: 'User already blocked' };

    await this.prismaService.user.update({
      where: { id: userId },
      data: { blockedUsers: { connect: { id: id } } },
    });
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

  async followUser(body: FriendsType) {
    const { userId, id } = body;

    const existingFollow = await this.isFollowing(userId, id);
    this.logger.log(existingFollow);

    if (existingFollow)
      return { message: 'You are already following that user' };

    const existingBlockedUser = await this.userService.findBlockedUser(
      id,
      userId,
    );

    if (existingBlockedUser && existingBlockedUser.blockedUsers.length > 0)
      return { message: "You can't follow user that have blocked you" };

    await this.prismaService.follows.create({
      data: {
        follower: { connect: { id: userId } },
        following: { connect: { id: id } },
      },
    });
  }

  async unfollowUser(body: FriendsType) {
    const { userId, id } = body;

    const existingFollow = await this.isFollowing(userId, id);
    if (!existingFollow)
      return { message: "You cannot unfollow user that you're not following" };

    await this.prismaService.follows.delete({
      where: {
        followerId_followingId: { followerId: userId, followingId: id },
      },
    });
  }

  private async isFollowing(userId: string, id: string) {
    const existingFollow = await this.prismaService.follows.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: id },
      },
    });
    return existingFollow;
  }
}
