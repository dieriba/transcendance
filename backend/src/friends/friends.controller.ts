import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { ReqDec } from 'src/common/custom-decorator/get-header.decorator';
import { checkExisistingUser } from './pipes/check-existing-users';
import { FriendsType } from './types/friends.type';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}
  @Post('send-request')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends Request sent!')
  async sendFriendRequest(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.sendFriendRequest(body);
  }

  @Post('cancel-request')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends Request Canceled!')
  async cancelFriendRequest(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.cancelFriendRequest(body);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends Added!')
  async addFriends(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.acceptFriend(body);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Friends deleted!')
  async DeleteFriends(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.deleteFriends(body);
  }

  @Post('block')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User Blocked!')
  async blockUser(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.blockUser(body);
  }

  @Post('unblock')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User Unblocked!')
  async unblockUser(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.unblockUser(body);
  }
}
