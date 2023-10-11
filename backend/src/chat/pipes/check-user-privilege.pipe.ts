import { ChatService } from './../chat.service';
import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { ROLE } from '@prisma/client';
import { request } from 'express';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { BAD_REQUEST } from 'src/common/constant/http-error.constant';
import { ChatroomData } from '../dto/chatroom.dto';

@Injectable()
export class CheckUserPrivileges implements PipeTransform {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatroomUserService: ChatroomUserService,
  ) {}
  private readonly logger = new Logger(CheckUserPrivileges.name);
  async transform(chatroomDataDto: ChatroomData) {
    const { chatroomId, userId, users } = chatroomDataDto;

    const chatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    this.logger.log({ userId, chatroomUser });

    if (!chatroomUser)
      throw new CustomException(
        'The chatroom does not exists or User is not part of it',
        HttpStatus.NOT_FOUND,
      );

    if (chatroomUser.role !== ROLE.DIERIBA)
      throw new CustomException(
        `You have no right to perform the requested action in the groupe named ${chatroomUser.chatroom.chatroomName}`,
        HttpStatus.FORBIDDEN,
      );

    if (request.method !== 'DELETE') {
      const foundUsers = await this.chatService.getExistingUsers(users);
      this.logger.log({ users, foundUsers });
      this.logger.log(
        `Base length: ${users.length} and foundUser Length ${foundUsers.length}`,
      );

      if (foundUsers.length !== users.length)
        throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }

    this.logger.log('ok');

    return chatroomDataDto;
  }
}
