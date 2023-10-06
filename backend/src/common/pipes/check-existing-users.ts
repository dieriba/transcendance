import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { RequestWithAuth } from 'src/auth/type';
import { UserService } from 'src/user/user.service';
import { CustomException } from '../custom-exception/custom-exception';
import { UserChatRoom } from '../types/user-info.type';

@Injectable()
export class checkExisistingUser implements PipeTransform {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(checkExisistingUser.name);
  async transform(req: RequestWithAuth) {
    const [sender, receiver] = await Promise.all([
      this.userService.findUserById(req.userId, UserChatRoom),
      this.userService.findUserById(req.body.otherUserId, UserChatRoom),
    ]);

    if (!sender || !receiver)
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);
    req.body.userId = req.userId;

    return req;
  }
}
