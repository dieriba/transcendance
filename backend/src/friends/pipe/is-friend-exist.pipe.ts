import { UserService } from 'src/user/user.service';
import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { UserData } from 'src/common/types/user-info.type';
import { FriendsTypeDto } from '../dto/friends.dto';

@Injectable()
export class IsFriendExist implements PipeTransform {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(IsFriendExist.name);
  async transform(body: FriendsTypeDto) {
    const { friendId } = body;
    const user = this.userService.findUserById(friendId, UserData);

    if (!user)
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);
    return body;
  }
}
