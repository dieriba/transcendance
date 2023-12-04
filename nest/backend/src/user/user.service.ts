import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiUser, CreatedUser, Profile } from './types/user.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserData, UserInfo } from 'src/common/types/user-info.type';
import { ChatroomUserInfo } from 'src/common/types/chatroom-user-type';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { CustomException } from 'src/common/custom-exception/custom-exception';
type optionalDataUser = Partial<User>;

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserInfo(userId: string, id: string) {
    const [me, user] = await Promise.all([
      this.findUserById(userId, UserData),
      this.prismaService.user.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          status: true,
          nickname: true,
          pong: {
            select: {
              victory: true,
              losses: true,
              rating: true,
            },
          },
          blockedBy: {
            where: {
              id: userId,
            },
          },
        },
      }),
    ]);

    if (!me || !user) throw new UserNotFoundException();

    if (user.blockedBy.length > 0)
      throw new CustomException(
        `${user.nickname} blocked thus you can't get his profile`,
        HttpStatus.FORBIDDEN,
      );
    return user;
  }

  async createUser(user: CreatedUser, profile: Profile, select: UserInfo) {
    return await this.prismaService.user.create({
      data: { ...user, profile: { create: { ...profile } } },
      select,
    });
  }

  async findUserByEmail(email: string, select: UserInfo) {
    return await this.prismaService.user.findUnique({
      where: { email },
      select,
    });
  }

  async findUserByNickName(nickname: string, select: UserInfo) {
    return await this.prismaService.user.findUnique({
      where: { nickname },
      select,
    });
  }

  async findUserById(id: string, select: UserInfo) {
    return await this.prismaService.user.findUnique({
      where: { id },
      select,
    });
  }

  async findManyUsers(ids: string[], select: UserInfo) {
    return await this.prismaService.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select,
    });
  }

  async findBlockedUser(userId: string, id: string) {
    return await this.prismaService.user.findUnique({
      where: {
        id: userId,
        AND: {
          OR: [
            {
              blockedBy: {
                some: { id },
              },
            },
            {
              blockedUsers: {
                some: { id },
              },
            },
          ],
        },
      },
      select: {
        blockedBy: true,
        blockedUsers: true,
      },
    });
  }

  async findUsersAndHisChatroom(userId: string, select: ChatroomUserInfo) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        chatrooms: {
          select,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return user;
  }

  async updateUserByEmail(email: string, data: optionalDataUser) {
    return await this.prismaService.user.update({
      where: { email },
      data,
    });
  }

  async updateUserById(id: string, data: Partial<User>) {
    return await this.prismaService.user.update({
      where: { id },
      data,
      include: {
        profile: {
          select: {
            avatar: true,
            lastname: true,
            firstname: true,
          },
        },
      },
    });
  }

  async createOrReturn42User(
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    user: ApiUser,
    profile: Profile,
    select: UserInfo,
  ) {
    const foundUser = await tx.user.findUnique({
      where: { email: user.email },
      select,
    });

    if (foundUser) return foundUser;

    const newUser = await tx.user.create({
      data: { ...user, profile: { create: profile } },
      select,
    });

    return newUser;
  }

  async clearHashedToken(id: string, data: optionalDataUser) {
    await this.prismaService.user.update({
      where: { id, hashedRefreshToken: { not: null } },
      data,
    });
  }

  async getAllChatableUsers() {

  }

  async getExistingUsers(usersId: string[]): Promise<string[]> {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: usersId,
        },
      },
    });

    return foundUsers.map((user) => user.nickname);
  }

  async getNonExistingUsers(usersId: string[]): Promise<string[]> {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        nickname: {
          notIn: usersId,
        },
      },
      select: {
        nickname: true,
      },
    });

    return foundUsers.map((user) => user.nickname);
  }

  async getExistingUserFriend(
    userId: string,
    usersId: string[],
    select: UserInfo,
  ) {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: usersId,
        },
        OR: [
          { friends: { some: { friendId: userId } } },
          { groupParameter: { allowAll: true } },
        ],
      },
      select,
    });

    return foundUsers;
  }

  async getExistingUserFriendArr(
    userId: string,
    usersId: string[],
    select: UserInfo,
  ) {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: usersId,
        },
        friends: { some: { friendId: userId } },
      },
      select,
    });

    return foundUsers.map((user) => user.id);
  }
}
