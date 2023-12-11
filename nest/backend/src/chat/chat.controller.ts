import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ChatService } from './chat.service';
import { IsRestrictedUserGuardHttp } from './guards/is-restricted-user.guard.http';
import { ChatroomIdWithUserIdDto } from './dto/chatroom.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('get-all-chatables-users')
  async getAllChatableUsers(@GetUser('userId') userId: string) {
    return await this.chatService.getAllChatableUsers(userId);
  }

  @Get('get-all-private-chatroom')
  async getUserChatroom(@GetUser('userId') userId: string) {
    return await this.chatService.getUserChatroom(userId);
  }

  @Get('get-all-joinable-chatroom')
  async getJoinableChatroom(@GetUser('userId') userId: string) {
    return await this.chatService.getJoinableChatroom(userId);
  }

  @Get('get-all-group-invitation')
  async getAllGroupInvitation(@GetUser('userId') userId: string) {
    return await this.chatService.getAllGroupInvitation(userId);
  }

  @Get('get-all-invited-users')
  async getAllInvitedUsers(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllInvitedUser(userId, chatroomId);
  }

  @UseGuards(IsRestrictedUserGuardHttp)
  @Get('get-all-user-chatroom')
  async getAllUserInChatroom(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllUserInChatroom(userId, chatroomId);
  }

  @Get('get-all-chatroom-message')
  async getAllChatroomMessage(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllChatroomMessage(userId, chatroomId);
  }

  @Get('get-all-restricted-user')
  async getAllRestrictedUser(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllRestrictedUser(userId, chatroomId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-restriction-detail')
  async getRestrictionDetatil(
    @GetUser('userId') userId: string,
    @Body() chatroomIdWithUserIdDto: ChatroomIdWithUserIdDto,
  ) {
    return await this.chatService.getRestrictionDetatil(
      userId,
      chatroomIdWithUserIdDto,
    );
  }
}
