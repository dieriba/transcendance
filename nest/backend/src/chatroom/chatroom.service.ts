import { Injectable } from '@nestjs/common';
import { Chatroom, ROLE } from '@prisma/client';
import { ChatroomInfo } from 'src/common/types/chatroom-info-type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatroomService {
  constructor(private readonly prismaService: PrismaService) {}
  async findChatroom(chatroomId: string, select: ChatroomInfo) {
    return await this.prismaService.chatroom.findFirst({
      where: { id: chatroomId },
      select,
    });
  }

  async updateChatroom(chatroomId: string, data: Partial<Chatroom>) {
    return await this.prismaService.chatroom.update({
      where: {
        id: chatroomId,
      },
      data,
    });
  }

  async findChatroomWithSpecificUser(userId: string, chatroomId: string) {
    return await this.prismaService.chatroom.findFirst({
      where: { id: chatroomId },
      select: { users: { where: { userId } }, type: true, password: true },
    });
  }

  async findChatroomAndSuperAdmin(chatroomId: string) {
    const chatroomWithSuperadmin = await this.prismaService.chatroom.findUnique(
      {
        where: {
          id: chatroomId,
        },
        include: {
          users: {
            where: {
              role: ROLE.DIERIBA,
            },
          },
        },
      },
    );
    return chatroomWithSuperadmin;
  }

  async findChatroomUser(userId: string, chatroomId: string) {
    const user = await this.prismaService.chatroomUser.findUnique({
      where: {
        userId_chatroomId: {
          userId,
          chatroomId,
        },
      },
    });
    return user;
  }
}
