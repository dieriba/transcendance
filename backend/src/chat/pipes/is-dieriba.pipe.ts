import { ChatService } from '../chat.service';
import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { ROLE } from '@prisma/client';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { ChangeUserRoleDto, ChatroomDataDto } from '../dto/chatroom.dto';

@Injectable()
export class IsDieriba implements PipeTransform {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatroomUserService: ChatroomUserService,
  ) {}
  private readonly logger = new Logger(IsDieriba.name);
  async transform(data: ChatroomDataDto | ChangeUserRoleDto) {
    const { chatroomId, userId } = data;

    const chatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

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

    return data;
  }
}
