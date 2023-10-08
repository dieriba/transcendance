import { Injectable } from '@nestjs/common';
import { ROLE } from '@prisma/client';
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
  async findChatroomAndSuperAdmin(chatroomId: string) {
    const chatroomWithSuperadmin = await this.prismaService.chatroom.findUnique(
      {
        where: {
          id: chatroomId,
        },
        include: {
          users: {
            where: {
              privilege: ROLE.DIERIBA,
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
