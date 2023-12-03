import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';
import { FriendsModule } from 'src/friends/friends.module';
import { Argon2Module } from 'src/argon2/argon2.module';
import { ChatroomUserModule } from 'src/chatroom-user/chatroom-user.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { PongService } from 'src/pong/pong.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    ChatroomModule,
    ChatroomUserModule,
    Argon2Module,
    FriendsModule,
    JwtTokenModule,
  ],
  providers: [GatewayGateway, PongService],
  exports: [GatewayGateway],
})
export class GatewayModule {}
