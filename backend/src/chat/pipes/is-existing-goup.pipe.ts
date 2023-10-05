import { UserService } from 'src/user/user.service';
import { ChatroomMessageDto } from './../dto/chatroom.dto';
import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';

@Injectable()
export class IsExistingUserAndGroup implements PipeTransform {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(IsExistingUserAndGroup.name);
  async transform(chatroomMessageDto: ChatroomMessageDto) {
    if (!(await this.userService.findUserById(chatroomMessageDto.senderId)))
      throw new CustomException('User_not found', HttpStatus.NOT_FOUND);

    if (!(await this.userService.findChatroom(chatroomMessageDto.chatroomId)))
      throw new CustomException(
        "Can't send message to non existing chatroom",
        HttpStatus.NOT_FOUND,
      );

    return chatroomMessageDto;
  }
}
