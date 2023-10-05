import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';
import { Argon2Module } from 'src/argon2/argon2.module';

@Module({
  imports: [JwtTokenModule, PrismaModule, UserModule, Argon2Module],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
