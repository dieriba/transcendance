import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { UserService } from './user.service';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserBlockList, UserData } from 'src/common/types/user-info.type';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { OK_RESPONSE } from 'src/common/constant/response.constant';
import { ChangeUserPasswordDto } from './dto/ChangeUserPassword.dto';
import { HashPassword } from 'src/auth/pipe/hash-password.pipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @ResponseMessage(OK_RESPONSE)
  async getUserInfo(@GetUser('userId') userId: string) {
    return await this.userService.findUserById(userId, UserData);
  }

  @Get('blocked')
  @ResponseMessage(OK_RESPONSE)
  async getBlockingList(@GetUser('userId') userId: string) {
    return await this.userService.findUserById(userId, UserBlockList);
  }

  @Patch('change-password')
  @ResponseMessage('Password updated!')
  async changeUserPassword(
    @GetUser('userId') userId: string,
    @Body(HashPassword) changeUserPasswordDto: ChangeUserPasswordDto,
  ) {
    return await this.userService.changeUserPassword(
      userId,
      changeUserPasswordDto,
    );
  }
}
