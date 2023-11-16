import { Injectable } from '@nestjs/common';
import { ChatroomUserInfo } from 'src/common/types/chatroom-user-type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatroomUserService {
  constructor(private readonly prismaService: PrismaService) {}
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

  async deleteChatroomUserById(userId: string, chatroomId: string) {
    await this.prismaService.chatroomUser.delete({
      where: {
        userId_chatroomId: {
          userId,
          chatroomId,
        },
      },
    });
  }

  async findChatroomUserDmWithoutSelect(senderId: string, receiverId: string) {
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
    });

    return chatroom;
  }

  async findChatChatroomUsersId(chatroomId: string, usersId: string[]) {
    const chatroomUser = await this.prismaService.chatroomUser.findMany({
      where: { chatroomId, user: { id: { in: usersId } } },
      select: { userId: true },
    });

    return chatroomUser.map((user) => user.userId);
  }

  createNewChatroomUser(userId: string, chatroomId: string) {
    const user = this.prismaService.chatroomUser.upsert({
      where: {
        userId_chatroomId: {
          userId,
          chatroomId,
        },
      },
      update: {},
      create: {
        userId,
        chatroomId,
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
            friends: {
              select: {
                friendId: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  async findChatroomUser(chatroomId: string, userId: string) {
    const user = await this.prismaService.chatroomUser.findFirst({
      where: {
        chatroomId,
        userId,
      },
      select: {
        user: {
          select: {
            id: true,
            nickname: true,
            blockedBy: { where: { id: userId } },
            blockedUsers: { where: { id: userId } },
          },
        },
        role: true,
        chatroom: {
          select: {
            chatroomName: true,
            password: true,
          },
        },
      },
    });
    return user;
  }
}
