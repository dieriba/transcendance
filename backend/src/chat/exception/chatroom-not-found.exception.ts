import { HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';

export class ChatRoomNotFoundException extends CustomException {
  constructor() {
    super('Chatroom Not Found', HttpStatus.NOT_FOUND);
  }
}
