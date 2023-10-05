import { HttpStatus, Injectable, Logger, PipeTransform } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RequestWithAuth } from 'src/auth/type';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { ChatService } from '../chat.service';
import { ROLE } from '@prisma/client';
import { BAD_REQUEST } from 'src/common/constant/http-error.constant';

@Injectable()
export class CheckUserPrivileges implements PipeTransform {
  constructor(
    private userService: UserService,
    private chatService: ChatService,
  ) {}
  private readonly logger = new Logger(CheckUserPrivileges.name);
  async transform(request: RequestWithAuth) {
    const { userId } = request;
    const { chatroomId } = request.body;

    if (!Array.isArray(request.body.users))
      throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);

    if (typeof chatroomId !== 'string' || chatroomId.length === 0)
      throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);

    const user = await this.userService.findUsersAndHisChatroom(userId);

    if (!user)
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);

    /*A modifier*/
    const chatroom = user.chatrooms.find((chatroom) => {
      return chatroom.chatroom.id === chatroomId;
    });

    if (chatroom === undefined)
      throw new CustomException(
        'The chatroom does not exists or user is not part of it',
        HttpStatus.NOT_FOUND,
      );

    if (chatroom.privilege !== ROLE.DIERIBA)
      throw new CustomException(
        `You have no right to perform the requested action in the groupe named ${chatroom.chatroom.chatroomName}`,
        HttpStatus.FORBIDDEN,
      );

    request.body.users = Array.from(new Set(request.body.users));

    if (request.method !== 'DELETE') {
      const { users } = request.body;
      const foundUsers = await this.chatService.getExistingUsers(
        request.body.users,
      );
      this.logger.log({ users, foundUsers });
      this.logger.log(
        `Base length: ${users.length} and foundUser Length ${foundUsers.length}`,
      );

      if (foundUsers.length !== users.length)
        throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }

    request.body.chatroomId = chatroom.chatroom.id;
    request.body.nickname = user.nickname;

    return request.body;
  }
}
