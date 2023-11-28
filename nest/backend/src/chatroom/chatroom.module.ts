import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChatroomService],
  exports: [ChatroomService],
})
export class ChatroomModule {}
