import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { UserService } from './user.service';
import { Controller, Get, Param } from '@nestjs/common';
import { UserBlockList, UserData } from 'src/common/types/user-info.type';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { OK_RESPONSE } from 'src/common/constant/response.constant';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @ResponseMessage(OK_RESPONSE)
  async getMyInfo(@GetUser('userId') userId: string) {
    return await this.userService.findUserById(userId, UserData);
  }

  @Get('get-all-chatables-users')
  async getAllChatableUsers(@GetUser('userId') userId: string) {
    return await this.getAllChatableUsers(userId);
  }

  @Get(':id')
  async getUserInfo(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return await this.userService.getUserInfo(userId, id);
  }

  @Get('blocked')
  @ResponseMessage(OK_RESPONSE)
  async getBlockingList(@GetUser('userId') userId: string) {
    return await this.userService.findUserById(userId, UserBlockList);
  }
}
