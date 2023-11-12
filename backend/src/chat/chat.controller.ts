import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import {
  JoinChatroomDto,
  RestrictedUsersDto,
  UnrestrictedUsersDto,
} from './dto/chatroom.dto';
import { ChatService } from './chat.service';
import { isDieribaOrAdmin } from './pipes/is-dieriba-or-admin.pipe';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { IsRestrictedUserGuard } from './guards/is-restricted-user.guard';
import { PassUserDataToBody } from 'src/common/interceptor/pass-user-data-to-body.interceptor';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('get-all-private-chatroom')
  async getUserChatroom(@GetUser('userId') userId: string) {
    return await this.chatService.getUserChatroom(userId);
  }

  @Get('get-all-chatroom-message')
  async getChatroomMessage(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllChatroomMessage(userId, chatroomId);
  }

  @Get('get-all-joinable-chatroom')
  async getJoinableChatroom(@GetUser('userId') userId: string) {
    return await this.chatService.getJoinableChatroom(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-all-user-chatroom')
  async getAllUserChatroom(
    @GetUser('userId') userId: string,
    @Query('chatroomId') chatroomId: string,
  ) {
    return await this.chatService.getAllUserChatroom(userId, chatroomId);
  }

  @Post('restrict-users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User have successfully been restricted')
  @UseInterceptors(PassUserDataToBody)
  async restrictUsers(
    @Body(isDieribaOrAdmin) restrictedUsersDto: RestrictedUsersDto,
  ) {
    return await this.chatService.restrictUser(restrictedUsersDto);
  }

  @Post('unrestrict-users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User have successfully been unrestricted')
  @UseInterceptors(PassUserDataToBody)
  async unrestrictUsers(
    @Body(isDieribaOrAdmin) unrestrictedUsersDto: UnrestrictedUsersDto,
  ) {
    return await this.chatService.unrestrictUser(unrestrictedUsersDto);
  }

  @Post('join-chat')
  @UseGuards(IsRestrictedUserGuard)
  @HttpCode(HttpStatus.OK)
  async joinChatroom(
    @GetUser('userId') userId: string,
    @Body() joinChatroomDto: JoinChatroomDto,
  ) {
    return await this.chatService.joinChatroom(userId, joinChatroomDto);
  }

  @Get('all-users')
  @HttpCode(HttpStatus.OK)
  async findAllUserChats(@GetUser('userId') userId: string) {
    return await this.chatService.findAllUsersChat(userId);
  }

  /*@Post('send-dm')
  @HttpCode(HttpStatus.OK)
  async sendDmToPenfriend(
    @GetUser('userId') id: string,
    @Body() dmMessageDto: DmMessageDto,
  ) {
    return await this.chatService.sendDmToPenfriend(
      id,
      dmMessageDto,
      ChatroomUserBaseData,
    );
  }

  @Post('send-chatroom')
  @ChatRoute()
  @UseInterceptors(PassUserDataToBody)
  @HttpCode(HttpStatus.OK)
  async sendMessageToChatroom(
    @Body(IsExistingUserAndGroup)
    chatroomMessageDto: ChatroomMessageDto,
  ) {
    return await this.chatService.sendMessageToChatroom(chatroomMessageDto);
  }*/
}
