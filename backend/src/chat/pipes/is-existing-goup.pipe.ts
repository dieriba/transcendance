import { UserService } from 'src/user/user.service';
import { ChatroomMessageDto } from './../dto/chatroom.dto';
import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserData } from 'src/common/types/user-info.type';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { ChatroomBaseData } from 'src/common/types/chatroom-info-type';

@Injectable()
export class IsExistingUserAndGroup implements PipeTransform {
  constructor(
    private readonly userService: UserService,
    private readonly chatroomService: ChatroomService,
  ) {}
  private readonly logger = new Logger(IsExistingUserAndGroup.name);
  async transform(chatroomMessageDto: ChatroomMessageDto) {
    this.logger.log({
      id: chatroomMessageDto.chatroomId,
      userId: chatroomMessageDto.userId,
    });
    if (
      !(await this.userService.findUserById(
        chatroomMessageDto.userId,
        UserData,
      ))
    )
      throw new CustomException('User_not found', HttpStatus.NOT_FOUND);
    const chatroom = await this.chatroomService.findChatroom(
      chatroomMessageDto.chatroomId,
      ChatroomBaseData,
    );
    if (!chatroom)
      throw new CustomException(
        "Can't send message to non existing chatroom",
        HttpStatus.NOT_FOUND,
      );

    return { ...chatroomMessageDto, chatroomName: chatroom.chatroomName };
  }
}
