import { Controller, Post } from '@nestjs/common';
import { BlockUserDto } from './dto/friends.dto';
import { FriendsService } from './friends.service';
import { ReqDec } from 'src/common/custom-decorator/get-header.decorator';
import { checkExisistingUser } from 'src/common/pipes/check-existing-users';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}
  @Post('block')
  async blockUser(@ReqDec(checkExisistingUser) blockedUser: BlockUserDto) {
    return await this.friendService.blockUser(blockedUser);
  }

  @Post('unblock')
  async unblockUser(@ReqDec(checkExisistingUser) blockedUser: BlockUserDto) {
    return await this.friendService.unblockUser(blockedUser);
  }
}
