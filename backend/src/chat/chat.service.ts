import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from './../user/user.service';
import {
  ChatRoomDto,
  ChatroomMessageDto,
  JoinChatroomDto,
  RestrictedUsersDto,
} from './dto/chatroom.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoomData, Message } from './types/chatroom.types';
import { ROLE, TYPE } from '@prisma/client';
import { Argon2Service } from 'src/argon2/argon2.service';
import { UserData } from 'src/common/types/user-info.type';
import {
  ChatroomUserBaseData,
  ChatroomUserInfo,
} from 'src/common/types/chatroom-user-type';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { ChatroomBaseData } from 'src/common/types/chatroom-info-type';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { FriendsService } from 'src/friends/friends.service';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { ChatRoomNotFoundException } from './exception/chatroom-not-found.exception';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatroomService: ChatroomService,
    private readonly chatroomUserService: ChatroomUserService,
    private readonly argon2Service: Argon2Service,
    private readonly friendService: FriendsService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async createChatRoom(creatorId: string, chatroomDto: ChatRoomDto) {
    const { users, ...chatroom } = chatroomDto;
    const { chatroomName } = chatroom;
    const user = this.userService.findUserById(creatorId, UserData);

    if (!user) throw new UserNotFoundException();

    this.logger.log(
      `Attempting to create the chatroom: ${chatroomName} where ${creatorId} will be the admin`,
    );

    const chatRoom = await this.prismaService.chatroom.findFirst({
      where: { chatroomName },
    });

    if (chatRoom)
      throw new CustomException(
        `The chatroom name: ${chatroomName} is already taken`,
        HttpStatus.BAD_REQUEST,
      );

    let existingUserId = await this.getExistingUserNonBlocked(creatorId, users);

    existingUserId = Array.from(new Set(existingUserId));

    existingUserId.push(creatorId);

    this.logger.log(existingUserId);

    const newChatroom = await this.prismaService.chatroom.create({
      data: {
        ...chatroom,
        users: {
          create: existingUserId.map((userId) => ({
            user: {
              connect: { id: userId },
            },
            role: creatorId === userId ? ROLE.DIERIBA : ROLE.REGULAR_USER,
          })),
        },
      },
      select: {
        id: true,
        chatroomName: true,
        type: true,
        users: true,
      },
    });

    this.logger.log('New chatroom created and users linked:', newChatroom);
    return newChatroom;
  }

  async setNewAdminUser(userId: string, chatroomData: ChatRoomData) {
    const { users, chatroomId } = chatroomData;

    const chatroom = await this.prismaService.chatroom.findUnique({
      where: { id: chatroomId },
    });

    if (!chatroom) throw new ChatRoomNotFoundException();

    const existingUserAndNonBlocked = await this.getExistingUserNonBlocked(
      userId,
      users,
    );

    const updatedChatrooms = await this.prismaService.chatroomUser.updateMany({
      where: {
        userId: { in: existingUserAndNonBlocked },
      },
      data: {
        role: ROLE.CHAT_ADMIN,
      },
    });

    return updatedChatrooms;
  }

  async restrictUsers(restrictedUsersDto: RestrictedUsersDto) {}

  async addNewUserToChatroom(userId: string, chatRoomData: ChatRoomData) {
    const { users, chatroomId } = chatRoomData;
    this.logger.log(chatroomId);
    const existingUserAndNonBlocked = await this.getExistingUserNonBlocked(
      userId,
      users,
    );
    const newUsers = await this.prismaService.$transaction(
      existingUserAndNonBlocked.map((userId) =>
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
  }

  async joinChatroom(id: string, joinChatroomDto: JoinChatroomDto) {
    const chatroom = await this.chatroomService.findChatroom(
      joinChatroomDto.chatroomId,
      ChatroomBaseData,
    );

    if (!chatroom) throw new ChatRoomNotFoundException();

    if (chatroom.type === TYPE.PRIVATE) {
      const foundUser = await this.chatroomService.findChatroomUser(
        id,
        joinChatroomDto.chatroomId,
      );

      if (!foundUser)
        throw new CustomException(
          "You can't join that private chatroom, you need to be invited first",
          HttpStatus.UNAUTHORIZED,
        );
    } else if (chatroom.type === TYPE.PROTECTED) {
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

  async findAllUsersChat(userId: string) {
    return await this.userService.findUsersAndHisChatroom(
      userId,
      ChatroomUserBaseData,
    );
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
  }

  async sendDmToPenfriend(message: Message, select: ChatroomUserInfo) {
    const chatroom = await this.chatroomUserService.findChatroomUserDm(
      message.senderId,
      message.receiverId,
      select,
    );
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
  }

  async getExistingUserNonBlocked(
    userId: string,
    usersId: string[],
  ): Promise<string[]> {
    const foundUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: usersId,
        },
        NOT: {
          AND: [
            {
              blockedBy: {
                some: {
                  id: userId,
                },
              },
            },
            {
              blockedUsers: {
                some: {
                  id: userId,
                },
              },
            },
          ],
        },
      },
    });
    return foundUsers.map((user) => user.nickname);
  }

  async getExistingUsers(usersId: string[]): Promise<string[]> {
    console.log({ usersId });

    const foundUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: usersId,
        },
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
