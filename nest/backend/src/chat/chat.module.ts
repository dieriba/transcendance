import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';
import { Argon2Module } from 'src/argon2/argon2.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';
import { ChatroomUserModule } from 'src/chatroom-user/chatroom-user.module';
import { FriendsModule } from 'src/friends/friends.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ChatroomModule,
    ChatroomUserModule,
    Argon2Module,
    FriendsModule,
    GatewayModule,
    JwtTokenModule,
  ],
  providers: [ChatService],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
