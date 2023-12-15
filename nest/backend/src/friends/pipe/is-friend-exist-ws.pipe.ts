import { UserService } from 'src/user/user.service';
import { UserData } from 'src/common/types/user-info.type';
import { FriendsTypeDto } from '../dto/friends.dto';
import { WsUserNotFoundException } from 'src/common/custom-exception/ws-exception';
import { Injectable, PipeTransform, Logger } from '@nestjs/common';

@Injectable()
export class IsFriendExistWs implements PipeTransform {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(IsFriendExistWs.name);
  async transform(body: FriendsTypeDto) {
    const { friendId } = body;
    const user = await this.userService.findUserById(friendId, UserData);

    if (!user) throw new WsUserNotFoundException();
    return body;
  }
}
