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
}
