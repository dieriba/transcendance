import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [JwtTokenModule, PrismaModule, UserModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
