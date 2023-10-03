import { Controller, Post, Get, Body, Put, Delete } from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ChatRoomDto } from './dto/chatroom.dto';
import { ChatService } from './chat.service';
import { ReqDec } from 'src/common/custom-decorator/get-header.decorator';
import { CheckUserPrivileges } from './pipes/checkPrivileges.pipes';
import { ChatRoomData } from './types/chatroom.types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post()
  async createChatRoom(
    @GetUser('nickname') nickname: string,
    @Body() chatRoomDto: ChatRoomDto,
  ) {
    return await this.chatService.createChatRoom(nickname, chatRoomDto);
  }

  @Get()
  async findAllUserChats(@GetUser('nickname') nickname: string) {
    return await this.chatService.findAllUsersChat(nickname);
  }

  @Put()
  async addNewUserToChatroom(@ReqDec(CheckUserPrivileges) body: ChatRoomData) {
    return await this.chatService.addNewUserToChatroom(body);
  }

  @Delete()
  async deleteUserFromChatroom(
    @ReqDec(CheckUserPrivileges) body: ChatRoomData,
  ) {
    return await this.chatService.deleteUserFromChatromm(body);
  }
}
