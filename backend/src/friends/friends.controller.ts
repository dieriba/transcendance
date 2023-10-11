import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { CheckExisistingUser } from './interceptor/check-existing-users.interceptor';
import { FriendsType } from './types/friends.type';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}
  @Post('send-request')
  @UseInterceptors(CheckExisistingUser)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends Request sent!')
  async sendFriendRequest(@Body() body: FriendsType) {
    return await this.friendService.sendFriendRequest(body);
  }

  @Post('cancel-request')
  @UseInterceptors(CheckExisistingUser)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends Request Canceled!')
  async cancelFriendRequest(@Body() body: FriendsType) {
    return await this.friendService.cancelFriendRequest(body);
  }

  @Post('add')
  @UseInterceptors(CheckExisistingUser)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends Added!')
  async addFriends(@Body() body: FriendsType) {
    return await this.friendService.acceptFriend(body);
  }

  @Post('delete')
  @UseInterceptors(CheckExisistingUser)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends deleted!')
  async DeleteFriends(@Body() body: FriendsType) {
    return await this.friendService.deleteFriends(body);
  }

  @Post('block')
  @UseInterceptors(CheckExisistingUser)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User Blocked!')
  async blockUser(@Body() body: FriendsType) {
    return await this.friendService.blockUser(body);
  }

  @Post('unblock')
  @UseInterceptors(CheckExisistingUser)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User Unblocked!')
  async unblockUser(@Body() body: FriendsType) {
    return await this.friendService.unblockUser(body);
  }
}
