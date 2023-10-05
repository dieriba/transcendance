import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from './../user/user.service';
import {
  ChatRoomDto,
  ChatroomMessageDto,
  JoinChatroomDto,
} from './dto/chatroom.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoomData, Message } from './types/chatroom.types';
import { ROLE, TYPE } from '@prisma/client';
import { INTERNAL_SERVER_ERROR } from 'src/common/constant/http-error.constant';
import { Argon2Service } from 'src/argon2/argon2.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly argon2Service: Argon2Service,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async findAllUsersChat(userId: string) {
    try {
      return await this.userService.findUsersAndHisChatroom(userId);
    } catch (error) {
      this.logger.error(
        `An error occured while trying to fetch all user's chats`,
      );
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createChatRoom(creatorId: string, chatroomDto: ChatRoomDto) {
    const { users, ...chatroom } = chatroomDto;
    const { chatroomName } = chatroom;
    const user = this.userService.findUserById(creatorId);

    if (!user)
      throw new CustomException('User Not found', HttpStatus.NOT_FOUND);

    this.logger.log(
      `Attempting to create the chatroom: ${chatroomName} where ${creatorId} will be the admin`,
    );

    let existingUserId = await this.getExistingUsers(users);

    existingUserId = Array.from(new Set(existingUserId));

    existingUserId.push(creatorId);

    this.logger.log(existingUserId);

    const chatRoom = await this.prismaService.chatroom.findFirst({
      where: { chatroomName },
    });

    if (chatRoom)
      throw new CustomException(
        `The chatroom name: ${chatroomName} is already taken`,
        HttpStatus.BAD_REQUEST,
      );

    const newChatroom = await this.prismaService.chatroom.create({
      data: {
        ...chatroom,
        users: {
          create: existingUserId.map((userId) => ({
            user: {
              connect: { id: userId },
            },
            privilege: creatorId === userId ? ROLE.DIERIBA : ROLE.REGULAR_USER,
          })),
        },
        numberOfUser: existingUserId.length,
      },
      include: {
        users: true,
      },
    });

    this.logger.log('New chatroom created and users linked:', newChatroom);
    return newChatroom;
  }

  async addNewUserToChatroom(chatRoomData: ChatRoomData) {
    const { users, chatroomId } = chatRoomData;
    this.logger.log(chatroomId);
    try {
      const newUsers = await this.prismaService.$transaction(
        users.map((userId) =>
          this.prismaService.chatroomUser.upsert({
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
          }),
        ),
      );
      return newUsers;
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async joinChatroom(id: string, joinChatroomDto: JoinChatroomDto) {
    const chatroom = await this.userService.findChatroom(
      joinChatroomDto.chatroomId,
    );

    if (!chatroom) {
      throw new CustomException(
        "Can't join a chatroom that does not exists",
        HttpStatus.NOT_FOUND,
      );
    }

    const users = chatroom.users;

    const foundUser = users.find((user) => user.userId === id);

    if (!foundUser)
      throw new CustomException(
        "You can't join this chatroom, you're either not part of the chatroom or it is private",
        HttpStatus.UNAUTHORIZED,
      );

    if (chatroom.type === TYPE.PROTECTED) {
      const match = await this.argon2Service.compare(
        joinChatroomDto.roomPassword,
        chatroom.password,
      );
      if (!match)
        throw new CustomException(
          "Wrong password, you can't acces that chatroom",
          HttpStatus.UNAUTHORIZED,
        );
    }

    return chatroom;
  }

  async deleteUserFromChatromm(chatroomData: ChatRoomData) {
    const { users, chatroomId, nickname } = chatroomData;

    const creator = users.find((userNickname) => userNickname == nickname);

    if (creator)
      throw new CustomException(
        'Cannot delete the admin of that room',
        HttpStatus.BAD_REQUEST,
      );

    const deletedUsers = await this.prismaService.chatroomUser.deleteMany({
      where: {
        chatroomId: chatroomId,
        userId: {
          in: users,
        },
      },
    });

    return deletedUsers;
  }

  async sendMessageToChatroom({
    chatroomId,
    senderId,
    content,
  }: ChatroomMessageDto) {
    try {
      const updatedChatrooms = await this.prismaService.chatroom.update({
        where: {
          id: chatroomId,
        },
        data: {
          messages: {
            create: {
              content: content,
              imageUrl: null,
              userId: senderId,
            },
          },
        },
      });

      return updatedChatrooms;
    } catch (error) {
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendDmToPenfriend(message: Message) {
    const chatroom = await this.userService.findChatroomUserDm(
      message.senderId,
      message.receiverId,
    );

    try {
      if (!chatroom) return await this.createChatroomDm(message);

      return await this.prismaService.chatroom.update({
        where: {
          id: chatroom.chatroomId,
        },
        data: {
          messages: {
            create: {
              content: message.content,
              imageUrl: null,
              user: {
                connect: {
                  id: message.senderId,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getExistingUsers(usersId: string[]): Promise<string[]> {
    console.log({ usersId });

    const foundUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: usersId,
        },
      },
      select: {
        nickname: true,
      },
    });
    console.log({ foundUsers });

    return foundUsers.map((user) => user.nickname);
  }

  private async createChatroomDm({ senderId, receiverId, content }: Message) {
    return await this.prismaService.chatroom.create({
      data: {
        type: TYPE.DM,
        users: {
          create: [
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
        messages: {
          create: [
            {
              content: content,
              imageUrl: null,
              user: {
                connect: {
                  id: senderId,
                },
              },
            },
          ],
        },
      },
    });
  }

  private async getNonExistingUsers(usersId: string[]): Promise<string[]> {
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
}
