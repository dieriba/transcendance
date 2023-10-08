import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';
import { Argon2Module } from 'src/argon2/argon2.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';
import { ChatroomUserModule } from 'src/chatroom-user/chatroom-user.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [
    JwtTokenModule,
    PrismaModule,
    UserModule,
    Argon2Module,
    ChatroomModule,
    ChatroomUserModule,
    FriendsModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
