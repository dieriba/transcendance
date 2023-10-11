import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from './../user/user.service';
import {
  ChangeUserRoleDto,
  ChatRoomDto,
  ChatroomDataDto,
  ChatroomMessageDto,
  DieribaDto,
  DmMessageDto,
  JoinChatroomDto,
  RestrictedUsersDto,
} from './dto/chatroom.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLE, TYPE } from '@prisma/client';
import { Argon2Service } from 'src/argon2/argon2.service';
import { UserData, UserId } from 'src/common/types/user-info.type';
import {
  ChatroomUserBaseData,
  ChatroomUserInfo,
} from 'src/common/types/chatroom-user-type';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { FriendsService } from 'src/friends/friends.service';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { ChatRoomNotFoundException } from './exception/chatroom-not-found.exception';
import { LibService } from 'src/lib/lib.service';
import { BAD_REQUEST } from 'src/common/constant/http-error.constant';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatroomService: ChatroomService,
    private readonly chatroomUserService: ChatroomUserService,
    private readonly argon2Service: Argon2Service,
    private readonly friendService: FriendsService,
    private readonly libService: LibService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async createChatRoom(creatorId: string, chatroomDto: ChatRoomDto) {
    const { users, ...chatroom } = chatroomDto;
    const { chatroomName } = chatroom;
    const user = await this.userService.findUserById(creatorId, UserData);

    if (!user) throw new UserNotFoundException();

    this.logger.log(
      `Attempting to create the chatroom: ${chatroomName} who will be owned by ${user.nickname}`,
    );

    const chatRoom = await this.prismaService.chatroom.findFirst({
      where: { chatroomName },
    });

    if (chatRoom)
      throw new CustomException(
        `The chatroom name: ${chatroomName} is already taken`,
        HttpStatus.BAD_REQUEST,
      );

    const existingUserId = await this.userService.getExistingUserNonBlocked(
      creatorId,
      users,
      UserId,
    );

    this.logger.log({ existingUserId });

    existingUserId.push(creatorId);

    const newChatroom = await this.prismaService.chatroom.create({
      data: {
        ...chatroom,
        users: {
          create: existingUserId.map((id) => ({
            user: {
              connect: { id },
            },
            role: creatorId === id ? ROLE.DIERIBA : ROLE.REGULAR_USER,
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

  async addNewUserToChatroom(userId: string, chatRoomData: ChatroomDataDto) {
    const { users, chatroomId } = chatRoomData;
    this.logger.log(chatroomId);

    const existingUserAndNonBlocked =
      await this.userService.getExistingUserNonBlocked(userId, users, UserData);

    this.logger.log({ existingUserAndNonBlocked });
    const newUsers = await this.prismaService.$transaction(
      existingUserAndNonBlocked.map((userId) =>
        this.chatroomUserService.createNewChatroomUser(userId, chatroomId),
      ),
    );
    return newUsers;
  }

  async setNewChatroomDieriba(dieribaDto: DieribaDto) {
    const { id, userId, chatroomId } = dieribaDto;

    const chatroomUser = await this.chatroomUserService.findChatroomUser(
      userId,
      id,
    );

    if (!chatroomUser) throw new UserNotFoundException();

    if (chatroomUser.user.blockedUsers.length)
      throw new CustomException(
        "That user blocked you, hence you can't set him as Chat owner",
        HttpStatus.BAD_REQUEST,
      );
    else if (chatroomUser.user.blockedBy.length)
      throw new CustomException(
        "You blocked that user, hence you can't set him as Chat owner",
        HttpStatus.BAD_REQUEST,
      );

    const [updateMe, updateNewDieriba] = await this.prismaService.$transaction([
      this.prismaService.chatroomUser.update({
        where: { userId_chatroomId: { userId, chatroomId } },
        data: { role: ROLE.REGULAR_USER },
      }),
      this.prismaService.chatroomUser.update({
        where: { userId_chatroomId: { userId: id, chatroomId } },
        data: { role: ROLE.DIERIBA },
      }),
    ]);

    return { updateMe, updateNewDieriba };
  }

  async deleteUserFromChatromm(chatroomData: ChatroomDataDto) {
    const { users, chatroomId, nickname } = chatroomData;

    const creator = users.find((userNickname) => userNickname == nickname);

    if (creator)
      throw new CustomException(
        'Cannot delete DIERIBA Role of that room',
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

  async changeUserRole(changeUserRoleDto: ChangeUserRoleDto) {
    const { users, chatroomId, userId } = changeUserRoleDto;

    const idSet = new Set(users.map((user) => user.id));

    if (idSet.size !== users.length)
      throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);

    const foundUser = new Set(
      await this.userService.getExistingUserNonBlocked(
        userId,
        users.map((user) => user.id),
        UserData,
      ),
    );

    if (foundUser.size === 0)
      throw new CustomException(
        'None of the given user exist',
        HttpStatus.NOT_FOUND,
      );

    const existingUsers = users.filter((user) => idSet.has(user.id));

    const chatroom = await this.prismaService.chatroom.findUnique({
      where: { id: chatroomId },
    });

    if (!chatroom) throw new ChatRoomNotFoundException();

    const updatedChatroomsUser = await this.prismaService.$transaction(
      existingUsers.map((user) =>
        this.prismaService.chatroomUser.upsert({
          where: {
            userId_chatroomId: {
              userId: user.id,
              chatroomId,
            },
          },
          update: {
            role: user.role,
          },
          create: undefined,
        }),
      ),
    );

    return updatedChatroomsUser;
  }

  async restrictUsers(restrictedUsersDto: RestrictedUsersDto) {
    const {
      chatroomId,
      id,
      duration,
      restriction,
      durationUnit,
      userId,
      reason,
    } = restrictedUsersDto;

    const date = new Date();

    const updatedChatrooms = await this.prismaService.restrictedUser.upsert({
      where: {
        userId_chatroomId: {
          userId: id,
          chatroomId: chatroomId,
        },
      },
      update: {
        adminId: userId,
        restriction: restriction,
        restrictionTimeStart: date,
        restrictionTimeEnd: this.libService.getEndBanTime(
          durationUnit,
          date,
          duration,
        ),
        reason,
      },
      create: {
        adminId: userId,
        userId: id,
        chatroomId,
        restriction: restriction,
        restrictionTimeStart: date,
        restrictionTimeEnd: this.libService.getEndBanTime(
          durationUnit,
          date,
          duration,
        ),
        reason,
      },
    });

    return updatedChatrooms;
  }

  async joinChatroom(id: string, joinChatroomDto: JoinChatroomDto) {
    const { chatroomId, roomPassword } = joinChatroomDto;

    const chatroom = await this.chatroomService.findChatroomWithSpecificUser(
      id,
      chatroomId,
    );

    if (!chatroom) throw new ChatRoomNotFoundException();

    this.logger.log({ chatroom });

    if (chatroom.type !== TYPE.PUBLIC) {
      if (chatroom.type === TYPE.PRIVATE && chatroom.users.length === 0) {
        throw new CustomException(
          "You can't join that private chatroom, you need to be invited first",
          HttpStatus.UNAUTHORIZED,
        );
      } else if (chatroom.type === TYPE.PROTECTED) {
        const match = await this.argon2Service.compare(
          roomPassword,
          chatroom.password,
        );

        if (!match)
          throw new CustomException(
            "Wrong password, you can't acces that chatroom",
            HttpStatus.UNAUTHORIZED,
          );

        if (chatroom.users.length === 0) {
          await this.chatroomUserService.createNewChatroomUser(id, chatroomId);
        }
      }
    }

    return chatroom;
  }

  async findAllUsersChat(userId: string) {
    return await this.userService.findUsersAndHisChatroom(
      userId,
      ChatroomUserBaseData,
    );
  }

  async sendMessageToChatroom({
    userId,
    chatroomId,
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
            userId,
          },
        },
      },
    });

    return updatedChatrooms;
  }

  async sendDmToPenfriend(
    senderId: string,
    message: DmMessageDto,
    select: ChatroomUserInfo,
  ) {
    const { recipientId, content } = message;

    const chatroom = await this.chatroomUserService.findChatroomUserDm(
      senderId,
      recipientId,
      select,
    );
    if (!chatroom) return await this.createChatroomDm(senderId, message);

    return await this.prismaService.chatroom.update({
      where: {
        id: chatroom.chatroomId,
      },
      data: {
        messages: {
          create: {
            content: content,
            imageUrl: null,
            user: {
              connect: {
                id: senderId,
              },
            },
          },
        },
      },
    });
  }

  private async createChatroomDm(
    senderId: string,
    { recipientId, content }: DmMessageDto,
  ) {
    return await this.prismaService.chatroom.create({
      data: {
        type: TYPE.DM,
        users: {
          create: [
            {
              userId: senderId,
              penFriend: recipientId,
            },
            {
              userId: recipientId,
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
}
