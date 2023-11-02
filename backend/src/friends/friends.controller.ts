import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsTypeDto } from './dto/friends.dto';
import { IsFriendExist } from './pipe/is-friend-exist.pipe';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}

  @Get('received-friends-request')
  @HttpCode(HttpStatus.OK)
  async getAllReceivedFriendRequest(@GetUser('userId') userId: string) {
    console.log('entered');

    return await this.friendService.getAllReceivedFriendsRequest(userId);
  }

  @Get('sent-friends-request')
  @HttpCode(HttpStatus.OK)
  async getAllSentFriendRequest(
    @Query('page') page: number = 1,
    @GetUser('userId') userId: string,
  ) {
    return await this.friendService.getAllSentFriendRequest(page, userId);
  }

  @Get('get-all-friends')
  @HttpCode(HttpStatus.OK)
  async getAllFriends(@GetUser('userId') userId: string) {
    return await this.friendService.getAllFriends(userId);
  }

  @Get('get-all-blocked-user')
  @HttpCode(HttpStatus.OK)
  async getAllBlockedUser(@GetUser('userId') userId: string) {
    return await this.friendService.getAllBlockedUser(userId);
  }

  @Post('friend/:nickname')
  @HttpCode(HttpStatus.OK)
  async getFriendDetails(@Body(IsFriendExist) body: FriendsTypeDto) {
    return await this.friendService.getFriendDetails(body);
  }
}
