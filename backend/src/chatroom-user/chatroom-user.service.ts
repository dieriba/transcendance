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

  async findChatChatroomUsersId(chatroomId: string, usersId: string[]) {
    const chatroomUser = await this.prismaService.chatroomUser.findMany({
      where: { chatroomId, user: { id: { in: usersId } } },
      select: { userId: true },
    });

    return chatroomUser.map((user) => user.userId);
  }

  async findChatroomUser(chatroomId: string, userId: string) {
    const user = await this.prismaService.chatroomUser.findFirst({
      where: {
        chatroomId,
        userId,
      },
      select: {
        user: {
          select: { id: true, nickname: true },
        },
        role: true,
        chatroom: {
          select: {
            chatroomName: true,
          },
        },
      },
    });
    return user;
  }
}
