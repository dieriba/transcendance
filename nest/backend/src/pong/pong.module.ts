import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LibModule } from 'src/lib/lib.module';

@Module({
  imports: [PrismaModule, LibModule],
  providers: [PongService],
  exports: [PongService],
})
export class PongModule {}
