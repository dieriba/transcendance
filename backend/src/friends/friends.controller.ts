import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { FriendsTypeDto } from './dto/friends.dto';
import { IsFriendExist } from './pipe/is-friend-exist.pipe';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}

  @Post('friend/:nickname')
  @HttpCode(HttpStatus.OK)
  async getFriendDetails(@Body(IsFriendExist) body: FriendsTypeDto) {
    return await this.friendService.getFriendDetails(body);
  }

  @Post('unblock')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User Unblocked!')
  async unblockUser(@Body(IsFriendExist) body: FriendsTypeDto) {
    return await this.friendService.unblockUser(body);
  }
}
