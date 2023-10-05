import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserService } from 'src/user/user.service';
import { DmMessageDto } from '../dto/chatroom.dto';

@Injectable()
export class checkSendMessage implements PipeTransform {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(checkSendMessage.name);
  async transform(dmMessageDto: DmMessageDto) {
    const [sender, receiver] = await Promise.all([
      this.userService.findUserById(dmMessageDto.senderId),
      this.userService.findUserById(dmMessageDto.receiverId),
    ]);

    if (!sender || !receiver)
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);

    return dmMessageDto;
  }
}
