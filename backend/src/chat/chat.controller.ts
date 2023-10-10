import {
  Controller,
  Post,
  Get,
  Body,
  Put,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import {
  ChatRoomDto,
  ChatroomMessageDto,
  DmMessageDto,
  JoinChatroomDto,
  RestrictedUsersDto,
} from './dto/chatroom.dto';
import { ChatService } from './chat.service';
import { ReqDec } from 'src/common/custom-decorator/get-header.decorator';
import { CheckUserPrivileges } from './pipes/check-privileges.pipe';
import { CheckGroupCreationValidity } from './pipes/check-group-creation-validity.pipe';
import { IsExistingUserAndGroup } from './pipes/is-existing-goup.pipe';
import { ChatroomUserBaseData } from 'src/common/types/chatroom-user-type';
import { IsDieribaOrAdminInterceptor } from './interceptors/is-dieriba-or-admin.interceptor';
import { ChatRoomData } from './types/chatroom.types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  async createChatRoom(
    @Body(CheckGroupCreationValidity) chatRoomDto: ChatRoomDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.chatService.createChatRoom(userId, chatRoomDto);
  }

  @Post()
  async setNewAdminUser(@ReqDec(CheckUserPrivileges) body: ChatRoomData) {
    return await this.chatService.setNewAdminUser(body.userId, body);
  }

  @Post('restrict-users')
  @UseInterceptors(IsDieribaOrAdminInterceptor)
  async restrictUsers(@Body() restrictedUsersDto: RestrictedUsersDto) {
    return await this.chatService.restrictUsers(restrictedUsersDto);
  }

  @Put()
  async addNewUserToChatroom(@ReqDec(CheckUserPrivileges) body: ChatRoomData) {
    return await this.chatService.addNewUserToChatroom(body.userId, body);
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
}
