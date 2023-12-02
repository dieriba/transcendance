import { Controller, Get } from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
  constructor(private readonly pongService: PongService) {}
  @Get('leaderboard')
  async getLeaderboard(@GetUser('userId') userId: string) {
    return await this.pongService.getLeaderboard(userId);
  }
}
