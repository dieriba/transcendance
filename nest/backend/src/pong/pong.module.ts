import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PongService],
  exports: [PongService],
})
export class PongModule {}
