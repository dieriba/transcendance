import { JwtAccessTokenGuard } from 'src/common/guards/jwt.guard';
import { UserService } from './user.service';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @UseGuards(JwtAccessTokenGuard)
  async getUserInfo() {
    return { message: 'ok' };
  }
}
