import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsGateway } from './friends.gateway';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';

@Module({
  imports: [UserModule, PrismaModule, GatewayModule, JwtTokenModule],
  providers: [FriendsService, FriendsGateway],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
