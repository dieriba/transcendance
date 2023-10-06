import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsGateway } from './friends.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [FriendsService, FriendsGateway],
  controllers: [FriendsController],
})
export class FriendsModule {}
