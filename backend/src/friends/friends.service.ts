import { HttpStatus, Injectable } from '@nestjs/common';
import { BlockUserDto } from './dto/friends.dto';
import { UserService } from 'src/user/user.service';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { INTERNAL_SERVER_ERROR } from 'src/common/constant/http-error.constant';

@Injectable()
export class FriendsService {
  constructor(private readonly userService: UserService) {}

  async blockUser(blockedUser: BlockUserDto) {}

  async unblockUser(blockedUser: BlockUserDto) {}
}
