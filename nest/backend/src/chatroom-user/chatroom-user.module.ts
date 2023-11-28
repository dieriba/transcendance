import { Module } from '@nestjs/common';
import { ChatroomUserService } from './chatroom-user.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChatroomUserService],
  exports: [ChatroomUserService],
})
export class ChatroomUserModule {}
