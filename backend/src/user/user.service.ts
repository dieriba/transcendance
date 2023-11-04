import { Injectable } from '@nestjs/common';
import { ApiUser, CreatedUser, Profile, TwoFa } from './types/user.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from 'src/common/types/user-info.type';
import { ChatroomUserInfo } from 'src/common/types/chatroom-user-type';
import { User } from '@prisma/client';

type optionalDataUser = Partial<User>;

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async updateUserById(id: string, data: optionalDataUser) {
    return await this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async updateUser2fa(id: string, twofa: TwoFa) {
    return await this.prismaService.twoFa.update({
      where: { userId: id },
      data: { ...twofa },
    });
  }

  async createOrReturn42User(
    user: ApiUser,
    profile: Profile,
    select: UserInfo,
  ) {
    console.log({ user, profile });

    const foundUser = await this.prismaService.user.findUnique({
      where: { email: user.email },
      select,
    });

    if (foundUser) return foundUser;

    const newUser = await this.prismaService.user.create({
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

  async getExistingUserNonBlocked(
    userId: string,
    usersId: string[],
    select: UserInfo,
  ): Promise<string[]> {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: usersId,
        },
        AND: [
          { blockedBy: { none: { id: userId } } },
          { blockedUsers: { none: { id: userId } } },
        ],
      },
      select,
    });
    return foundUsers.map((user) => user.id);
  }
}
