import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { FriendsTypeDto } from './dto/friends.dto';
import { IsFriendExist } from './pipe/is-friend-exist.pipe';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}

  @Get('received-friends-request')
  @HttpCode(HttpStatus.OK)
  async getAllReceivedFriendRequest(@GetUser('userId') userId: string) {
    return await this.friendService.getAllReceivedFriendsRequest(userId);
  }

  @Get('sent-friends-request')
  @HttpCode(HttpStatus.OK)
  async getAllSentFriendRequest(@GetUser('userId') userId: string) {
    return await this.friendService.getAllSentFriendRequest(userId);
  }

  @Get('get-all-friends')
  @HttpCode(HttpStatus.OK)
  async getAllFriends(@GetUser('userId') userId: string) {
    return await this.friendService.getAllFriends(userId);
  }

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
