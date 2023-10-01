import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';

@Module({
  imports: [JwtTokenModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
