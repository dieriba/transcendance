import { ResponseMessageInterceptor } from './common/global-interceptros/response.interceptor';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { Argon2Module } from './argon2/argon2.module';
import { JwtTokenModule } from './jwt-token/jwtToken.module';
import { LibModule } from './lib/lib.module';
import { TwoFaModule } from './two-fa/two-fa.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAccessTokenGuard } from './common/guards/jwt.guard';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { ChatroomUserModule } from './chatroom-user/chatroom-user.module';
import { UploadFilesModule } from './upload-files/upload-files.module';
import { PongController } from './pong/pong.controller';
import { PongModule } from './pong/pong.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.REQUEST_NUMBER),
        limit: parseInt(process.env.REQUEST_LIMIT),
      },
    ]),
    AuthModule,
    UserModule,
    PrismaModule,
    Argon2Module,
    JwtTokenModule,
    LibModule,
    TwoFaModule,
    ChatModule,
    FriendsModule,
    ChatroomModule,
    ChatroomUserModule,
    UploadFilesModule,
    PongModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAccessTokenGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseMessageInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [PongController],
})
export class AppModule {}
