import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { ChatRoomDto } from '../dto/chatroom.dto';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { TYPE } from '@prisma/client';
import { Argon2Service } from 'src/argon2/argon2.service';

@Injectable()
export class CheckGroupCreationValidity implements PipeTransform {
  constructor(private readonly argon2Service: Argon2Service) {}
  private readonly logger = new Logger(CheckGroupCreationValidity.name);
  async transform(chatroomDto: ChatRoomDto) {
    const { type, roomPassword } = chatroomDto;

    if (roomPassword !== undefined) {
      if (type !== TYPE.PROTECTED)
        throw new CustomException(
          'Only protected chatroom can set password',
          HttpStatus.BAD_REQUEST,
        );
      chatroomDto.roomPassword = await this.argon2Service.hash(roomPassword);
    }
    return chatroomDto;
  }
}
