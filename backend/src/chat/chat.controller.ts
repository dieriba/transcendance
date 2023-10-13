import {
  Controller,
  Post,
  Get,
  Body,
  Delete,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import {
  ChangeUserRoleDto,
  ChatRoomDto,
  ChatroomDataDto,
  ChatroomMessageDto,
  DieribaDto,
  DmMessageDto,
  JoinChatroomDto,
  RestrictedUsersDto,
  UnrestrictedUsersDto,
} from './dto/chatroom.dto';
import { ChatService } from './chat.service';
import { CheckGroupCreationValidity } from './pipes/check-group-creation-validity.pipe';
import { IsExistingUserAndGroup } from './pipes/is-existing-goup.pipe';
import { ChatroomUserBaseData } from 'src/common/types/chatroom-user-type';
import { isDieribaOrAdmin } from './pipes/is-dieriba-or-admin.pipe';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { IsDieriba } from './pipes/is-dieriba.pipe';
import { IsRestrictedUserGuard } from './guards/is-restricted-user.guard';
import { ChatRoute } from 'src/common/custom-decorator/metadata.decorator';
import { PassUserDataToBody } from 'src/common/interceptor/pass-user-data-to-body.interceptor';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create-chatroom')
  @ResponseMessage(
    'Successfully created chatroom and added user meeting the following criteria: not blocked you, not have blocked you and existing',
  )
  async createChatRoom(
    @Body(CheckGroupCreationValidity) chatRoomDto: ChatRoomDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.chatService.createChatRoom(userId, chatRoomDto);
  }

  @Post('add-user')
  @ResponseMessage(
    'Successfully added user meeting the following criteria: not blocked you, not have blocked you, not already in chatroom and existing',
  )
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(PassUserDataToBody)
  async addNewUserToChatroom(@Body(IsDieriba) body: ChatroomDataDto) {
    return await this.chatService.addNewUserToChatroom(body.userId, body);
  }

  @Post('set-chatroom-dieriba')
  @ResponseMessage('Ownership given successfully')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(PassUserDataToBody)
  async setNewChatroomDieriba(@Body(IsDieriba) dieribaDto: DieribaDto) {
    return await this.chatService.setNewChatroomDieriba(dieribaDto);
  }

  @Delete('delete-user')
  @UseInterceptors(PassUserDataToBody)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Successfully deleted user from chatroom meeting the following criteria: existing and in chatroom',
  )
  async deleteUserFromChatroom(@Body(IsDieriba) body: ChatroomDataDto) {
    return await this.chatService.deleteUserFromChatromm(body);
  }

  @Post('change-user-role')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Successfully change the role of user meeting the following criteria: existing in chatroom and not have blocked you',
  )
  @UseInterceptors(PassUserDataToBody)
  async changeUserRole(@Body(IsDieriba) body: ChangeUserRoleDto) {
    return await this.chatService.changeUserRole(body);
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

  @Post('send-dm')
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
  }
}
