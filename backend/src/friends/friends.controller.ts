import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { ReqDec } from 'src/common/custom-decorator/get-header.decorator';
import { checkExisistingUser } from './pipes/check-existing-users';
import { FriendsType } from './types/friends.type';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}
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

  @Post('follow')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User followed')
  async followUser(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.followUser(body);
  }

  @Post('unfollow')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User unfollowed')
  async unfollowUser(@ReqDec(checkExisistingUser) body: FriendsType) {
    return await this.friendService.unfollowUser(body);
  }
}
