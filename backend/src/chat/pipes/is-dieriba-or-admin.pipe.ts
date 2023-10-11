import { RestrictedUsersDto } from './../dto/chatroom.dto';
import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { ROLE } from '@prisma/client';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';

@Injectable()
export class isDieribaOrAdmin implements PipeTransform {
  readonly logger = new Logger(isDieribaOrAdmin.name);
  constructor(private readonly chatroomUserService: ChatroomUserService) {}
  async transform(restrictedUsersDto: RestrictedUsersDto) {
    const { chatroomId, userId, id } = restrictedUsersDto;
    this.logger.log({ restrictedUsersDto });

    const [chatroomUser, userToRestrict] = await Promise.all([
      this.chatroomUserService.findChatroomUser(chatroomId, userId),
      this.chatroomUserService.findChatroomUser(chatroomId, id),
    ]);

    if (!chatroomUser)
      throw new CustomException(
        'You are not part of that group or that group does not exist',
        HttpStatus.NOT_FOUND,
      );

    if (!userToRestrict) throw new UserNotFoundException();

    if (
      chatroomUser.role !== ROLE.DIERIBA &&
      chatroomUser.role !== ROLE.CHAT_ADMIN
    ) {
      throw new CustomException('Unauthorized', HttpStatus.BAD_REQUEST);
    }

    if (
      userToRestrict.role === ROLE.DIERIBA ||
      userToRestrict.role === ROLE.CHAT_ADMIN
    )
      throw new CustomException(
        'Cannot Restrict chat admin',
        HttpStatus.UNAUTHORIZED,
      );

    return restrictedUsersDto;
  }
}
