import { Controller, Post, Get, Body, Put, Delete } from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import {
  ChatRoomDto,
  ChatroomMessageDto,
  DmMessageDto,
  JoinChatroomDto,
} from './dto/chatroom.dto';
import { ChatService } from './chat.service';
import { ReqDec } from 'src/common/custom-decorator/get-header.decorator';
import { CheckUserPrivileges } from './pipes/check-privileges.pipe';
import { ChatRoomData } from './types/chatroom.types';
import { CheckGroupCreationValidity } from './pipes/check-group-creation-validity.pipe';
import { IsExistingUserAndGroup } from './pipes/is-existing-goup.pipe';
import { ChatroomUserBaseData } from 'src/common/types/chatroom-user-type';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post()
  async createChatRoom(
    @Body(CheckGroupCreationValidity) chatRoomDto: ChatRoomDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.chatService.createChatRoom(userId, chatRoomDto);
  }

  @Post()
  async joinChatroom(
    @GetUser('userId') id: string,
    joinChatroomDto: JoinChatroomDto,
  ) {
    return await this.chatService.joinChatroom(id, joinChatroomDto);
  }

  @Get()
  async findAllUserChats(@GetUser('userId') userId: string) {
    return await this.chatService.findAllUsersChat(userId);
  }

  @Put()
  async addNewUserToChatroom(@ReqDec(CheckUserPrivileges) body: ChatRoomData) {
    return await this.chatService.addNewUserToChatroom(body.userId, body);
  }

  @Delete()
  async deleteUserFromChatroom(
    @ReqDec(CheckUserPrivileges) body: ChatRoomData,
  ) {
    return await this.chatService.deleteUserFromChatromm(body);
  }

  @Post()
  async sendDmToPenfriend(@Body() dmMessageDto: DmMessageDto) {
    return await this.chatService.sendDmToPenfriend(
      dmMessageDto,
      ChatroomUserBaseData,
    );
  }

  @Post()
  async sendMessageToChatroom(
    @Body(IsExistingUserAndGroup) chatroomMessageDto: ChatroomMessageDto,
  ) {
    return await this.chatService.sendMessageToChatroom(chatroomMessageDto);
  }

  @Post()
  async blockUser() {
    return await this.chatService.blockUser();
  }

  @Post()
  async restrictUser() {
    return await this.chatService.restrictUser();
  }
}
