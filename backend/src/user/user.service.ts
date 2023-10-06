import { Injectable } from '@nestjs/common';
import { ApiUser, CreatedUser, Profile, TwoFa } from './types/user.types';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModel } from './types/user.types';
import { UserInfo } from 'src/common/types/user-info.type';
import { ChatroomUserInfo } from 'src/common/types/chatroom-user-type';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: CreatedUser) {
    return await this.prismaService.user.create({
      data: { ...user },
      select: { id: true, nickname: true, email: true, createdAt: true },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({ where: { email } });
  }

  async findUserByNickName(nickname: string, select: UserInfo) {
    return await this.prismaService.user.findUnique({
      where: { nickname },
      select: { ...select },
    });
  }

  async findUserById(id: string, select: UserInfo) {
    return await this.prismaService.user.findUnique({
      where: { id },
      select: {
        ...select,
      },
    });
  }

  async findChatroomUserDm(
    senderId: string,
    receiverId: string,
    select: ChatroomUserInfo,
  ) {
    const chatroom = await this.prismaService.chatroomUser.findFirst({
      where: {
        OR: [
          {
            userId: senderId,
            penFriend: receiverId,
          },
          {
            userId: receiverId,
            penFriend: senderId,
          },
        ],
      },
      select: {
        ...select,
      },
    });

    return chatroom;
  }

  async findChatroom(chatroomId: string) {
    return await this.prismaService.chatroom.findFirst({
      where: { id: chatroomId },
      select: {
        id: true,
        chatroomName: true,
        type: true,
        numberOfUser: true,
        users: true,
        messages: true,
        invitedUser: true,
        password: true,
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
          select: {
            ...select,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return user;
  }

  async updateUserByEmail(email: string, user: UserModel) {
    return await this.prismaService.user.update({
      where: { email },
      data: {
        email: user.email || undefined,
        nickname: user.nickname || undefined,
        hashedRefreshToken: user.hashedRefreshToken || undefined,
        password: user.password || undefined,
      },
    });
  }

  async updateUserById(id: string, update: UserModel) {
    return await this.prismaService.user.update({
      where: { id },
      data: {
        email: update.email || undefined,
        nickname: update.nickname || undefined,
        hashedRefreshToken: update.hashedRefreshToken || undefined,
        password: update.password || undefined,
      },
    });
  }

  async updateUser2fa(id: string, twofa: TwoFa) {
    return await this.prismaService.twoFa.update({
      where: { userId: id },
      data: { ...twofa },
    });
  }

  async createOrReturn42User(user: ApiUser, profile: Profile): Promise<User> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });

    if (foundUser) return foundUser;

    const newUser = await this.prismaService.user.create({
      data: { ...user, profile: { create: profile } },
    });

    return newUser;
  }

  async clearHashedToken(id: string) {
    await this.prismaService.user.update({
      where: { id, hashedRefreshToken: { not: null } },
      data: { hashedRefreshToken: null },
    });
  }
}
