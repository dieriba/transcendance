import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from './../user/user.service';
import { ChatRoomDto } from './dto/chatroom.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { INTERNAL_SERVER_ERROR } from 'src/common/constant/constant';
import { ChatRoomData, Message } from './types/chatroom.types';
import { REGULAR_CHAT_USER } from 'src/common/constant/chat.constant';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async findAllUsersChat(nickname: string) {
    try {
      return await this.userService.findChatroomsByUserNickname(nickname);
    } catch (error) {
      this.logger.error(
        `An error occured while trying to fetch all ${nickname}'s chats`,
      );
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createChatRoom(creator: string, { chatroomName, users }: ChatRoomDto) {
    const user = this.userService.findUserByNickName(creator);

    if (!user)
      throw new CustomException('User Not found', HttpStatus.NOT_FOUND);

    this.logger.log(
      `Attempting to create the chatroom: ${chatroomName} where ${creator} will be the admin`,
    );

    let existingUser = await this.getExistingUsers(users);

    existingUser = existingUser.filter((nickname) => nickname !== creator);

    existingUser.push(creator);

    this.logger.log(existingUser);

    const chatRoom = await this.prismaService.chatroom.findFirst({
      where: { name: chatroomName },
    });

    if (chatRoom)
      throw new CustomException(
        `The chatroom name: ${chatroomName} is already taken`,
        HttpStatus.BAD_REQUEST,
      );

    const newChatroom = await this.prismaService.chatroom.create({
      data: {
        name: chatroomName,
        users: {
          create: existingUser.map((nickname) => ({
            user: {
              connect: { nickname },
            },
            privilege: creator === nickname ? 'ADMIN' : 'REGULAR_USER',
          })),
        },
        number_of_user: existingUser.length,
      },
      include: {
        users: true,
      },
    });

    this.logger.log('New chatroom created and users linked:', newChatroom);
    return newChatroom;
  }

  async addNewUserToChatroom(chatRoomData: ChatRoomData) {
    const { users, chatroom_id } = chatRoomData;

    try {
      const newUsers = await this.prismaService.$transaction(
        users.map((nickname) =>
          this.prismaService.chatroomUser.upsert({
            where: {
              user_nickname_chatroom_id: {
                user_nickname: nickname,
                chatroom_id: chatroom_id,
              },
            },
            update: {},
            create: {
              user_nickname: nickname,
              chatroom_id: chatroom_id,
              privilege: REGULAR_CHAT_USER,
            },
          }),
        ),
      );
      return newUsers;
    } catch (error) {
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUserFromChatromm(chatroomData: ChatRoomData) {
    const { users, chatroom_id, nickname } = chatroomData;

    const creator = users.find((userNickname) => userNickname == nickname);

    if (creator)
      throw new CustomException(
        'Cannot delete the admin of that room',
        HttpStatus.BAD_REQUEST,
      );

    const deletedUsers = await this.prismaService.chatroomUser.deleteMany({
      where: {
        chatroom_id,
        user_nickname: {
          in: users,
        },
      },
    });

    return deletedUsers;
  }

  async sendPrivateMessage({ sender, receiver, content }: Message) {}

  async sendGroupMessage() {}

  async getExistingUsers(usernames: string[]): Promise<string[]> {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        nickname: {
          in: usernames,
        },
      },
      select: {
        nickname: true,
      },
    });

    return foundUsers.map((user) => user.nickname);
  }

  private async getNonExistingUsers(usernames: string[]): Promise<string[]> {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        nickname: {
          notIn: usernames,
        },
      },
      select: {
        nickname: true,
      },
    });

    return foundUsers.map((user) => user.nickname);
  }
}
