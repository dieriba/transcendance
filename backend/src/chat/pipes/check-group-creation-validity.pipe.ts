import { Injectable, PipeTransform, Logger } from '@nestjs/common';
import { ChatRoomDto } from '../dto/chatroom.dto';
import { TYPE } from '@prisma/client';
import { Argon2Service } from 'src/argon2/argon2.service';
import { WsBadRequestException } from 'src/common/custom-exception/ws-exception';

@Injectable()
export class CheckGroupCreationValidity implements PipeTransform {
  constructor(private readonly argon2Service: Argon2Service) {}
  private readonly logger = new Logger(CheckGroupCreationValidity.name);
  async transform(chatroomDto: ChatRoomDto) {
    const { type, password } = chatroomDto;

    if (type === TYPE.PROTECTED && password === undefined)
      throw new WsBadRequestException(
        'Protected room must have a password set',
      );
    if (password !== undefined) {
      if (type !== TYPE.PROTECTED)
        throw new WsBadRequestException(
          'Only protected chatroom can set password',
        );
      chatroomDto.password = await this.argon2Service.hash(password);
    }
    return chatroomDto;
  }
}
