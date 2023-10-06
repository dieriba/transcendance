import { Injectable } from '@nestjs/common';
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
}
