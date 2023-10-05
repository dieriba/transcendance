import { Controller, Post } from '@nestjs/common';

@Controller('friends')
export class FriendsController {
  @Post('block')
  async blockOneUser() {}
}
