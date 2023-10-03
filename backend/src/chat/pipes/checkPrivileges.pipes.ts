import { HttpStatus, Injectable, Logger, PipeTransform } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RequestWithAuth } from 'src/auth/type';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { CHAT_ADMIN } from 'src/common/constant/chat.constant';
import { ChatService } from '../chat.service';
import { BAD_REQUEST } from 'src/common/constant/constant';

@Injectable()
export class CheckUserPrivileges implements PipeTransform {
  constructor(
    private userService: UserService,
    private chatService: ChatService,
  ) {}
  private readonly logger = new Logger(CheckUserPrivileges.name);
  async transform(request: RequestWithAuth) {
    const { nickname } = request;
    const { chatroomName, users } = request.body;

    if (!Array.isArray(users))
      throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);

    if (typeof chatroomName !== 'string' || chatroomName.length === 0)
      throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);

    const user = await this.userService.findChatroomsByUserNickname(nickname);

    if (!user)
      throw new CustomException(
        `The nickname ${nickname} does not exists`,
        HttpStatus.NOT_FOUND,
      );

    const chatroom = user.chatrooms.find((chatroom) => {
      const { name } = chatroom.chatroom;
      return name === chatroomName;
    });

    if (chatroom === undefined)
      throw new CustomException(
        `The chatroom ${chatroomName} does not exists`,
        HttpStatus.NOT_FOUND,
      );

    if (chatroom.privilege !== CHAT_ADMIN)
      throw new CustomException(
        `You have no right to perform the requested action in the groupe named ${chatroom.chatroom.name}`,
        HttpStatus.FORBIDDEN,
      );

    if (request.method !== 'DELETE') {
      const foundUsers = await this.chatService.getExistingUsers(users);

      this.logger.log(
        `Base length: ${users.length} and foundUser Length ${foundUsers.length}`,
      );

      if (foundUsers.length !== users.length)
        throw new CustomException(BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }

    request.body.nickname = nickname;
    request.body.chatroom_id = chatroom.chatroom.id;

    return request.body;
  }
}
