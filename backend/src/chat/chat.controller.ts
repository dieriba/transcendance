import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ChatService } from './chat.service';
import { IsRestrictedUserGuardHttp } from './guards/is-restricted-user.guard.http';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('get-all-private-chatroom')
  async getUserChatroom(@GetUser('userId') userId: string) {
    return await this.chatService.getUserChatroom(userId);
  }

  @Get('get-all-joinable-chatroom')
  async getJoinableChatroom(@GetUser('userId') userId: string) {
    return await this.chatService.getJoinableChatroom(userId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(IsRestrictedUserGuardHttp)
  @Get('get-all-user-chatroom')
  async getAllUserChatroom(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllUserChatroom(userId, chatroomId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-all-chatroom-message')
  async getAllChatroomMessage(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllChatroomMessage(userId, chatroomId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-all-restricted-user')
  async getAllRestrictedUser(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllRestrictedUser(userId, chatroomId);
  }
}
