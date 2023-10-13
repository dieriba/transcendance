import { Injectable, PipeTransform, Logger } from '@nestjs/common';
import { ROLE } from '@prisma/client';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { ChangeUserRoleDto, ChatroomDataDto } from '../dto/chatroom.dto';
import {
  WsNotFoundException,
  WsUnauthorizedException,
} from 'src/common/custom-exception/ws-exception';

@Injectable()
export class IsDieriba implements PipeTransform {
  constructor(private readonly chatroomUserService: ChatroomUserService) {}
  private readonly logger = new Logger(IsDieriba.name);
  async transform(data: ChatroomDataDto | ChangeUserRoleDto) {
    const { chatroomId, userId } = data;
    this.logger.log(`User is undefined ${userId}`);
    const chatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    this.logger.log({ chatroomUser });

    if (!chatroomUser)
      throw new WsNotFoundException(
        'The chatroom does not exists or User is not part of it',
      );

    if (chatroomUser.role !== ROLE.DIERIBA)
      throw new WsUnauthorizedException(
        `You have no right to perform the requested action in the groupe named ${chatroomUser.chatroom.chatroomName}`,
      );

    return data;
  }
}
