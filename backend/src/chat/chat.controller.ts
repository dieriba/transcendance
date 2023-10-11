import {
  Controller,
  Post,
  Get,
  Body,
  Delete,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import {
  ChatRoomDto,
  ChatroomDataDto,
  ChatroomMessageDto,
  DmMessageDto,
  JoinChatroomDto,
  RestrictedUsersDto,
} from './dto/chatroom.dto';
import { ChatService } from './chat.service';
import { CheckGroupCreationValidity } from './pipes/check-group-creation-validity.pipe';
import { IsExistingUserAndGroup } from './pipes/is-existing-goup.pipe';
import { ChatroomUserBaseData } from 'src/common/types/chatroom-user-type';
import { isDieribaOrAdmin } from './pipes/is-dieriba-or-admin.pipe';
import { PassUserDataToBody } from 'src/common/interceptor/pass-user-data-to-body.interceptor';
import { CheckUserPrivileges } from './pipes/check-user-privilege.pipe';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create-chatroom')
  async createChatRoom(
    @Body(CheckGroupCreationValidity) chatRoomDto: ChatRoomDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.chatService.createChatRoom(userId, chatRoomDto);
  }

  @Post('add-user')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(PassUserDataToBody)
  async addNewUserToChatroom(@Body(CheckUserPrivileges) body: ChatroomDataDto) {
    return await this.chatService.addNewUserToChatroom(body.userId, body);
  }

  @Post('set-admin')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(PassUserDataToBody)
  async setNewAdminUser(@Body(CheckUserPrivileges) body: ChatroomDataDto) {
    return await this.chatService.setNewAdminUser(body.userId, body);
  }

  @Post('restrict-users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User restricted')
  @UseInterceptors(PassUserDataToBody)
  async restrictUsers(
    @Body(isDieribaOrAdmin) restrictedUsersDto: RestrictedUsersDto,
  ) {
    return await this.chatService.restrictUsers(restrictedUsersDto);
  }

  @Post('join-chat')
  @HttpCode(HttpStatus.OK)
  async joinChatroom(
    @GetUser('userId') id: string,
    joinChatroomDto: JoinChatroomDto,
  ) {
    return await this.chatService.joinChatroom(id, joinChatroomDto);
  }

  @Get('all-users')
  @HttpCode(HttpStatus.OK)
  async findAllUserChats(@GetUser('userId') userId: string) {
    return await this.chatService.findAllUsersChat(userId);
  }

  @Delete('delete-user')
  @UseInterceptors(PassUserDataToBody)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Users Deleted')
  async deleteUserFromChatroom(
    @Body(CheckUserPrivileges) body: ChatroomDataDto,
  ) {
    return await this.chatService.deleteUserFromChatromm(body);
  }

  @Post('send-dm')
  @HttpCode(HttpStatus.OK)
  async sendDmToPenfriend(@Body() dmMessageDto: DmMessageDto) {
    return await this.chatService.sendDmToPenfriend(
      dmMessageDto,
      ChatroomUserBaseData,
    );
  }

  @Post('send-chatroom')
  @HttpCode(HttpStatus.OK)
  async sendMessageToChatroom(
    @Body(IsExistingUserAndGroup) chatroomMessageDto: ChatroomMessageDto,
  ) {
    return await this.chatService.sendMessageToChatroom(chatroomMessageDto);
  }
}
