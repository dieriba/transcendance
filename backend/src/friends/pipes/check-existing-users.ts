import { LibService } from 'src/lib/lib.service';
import { Injectable, PipeTransform, Logger, HttpStatus } from '@nestjs/common';
import { RequestWithAuth } from 'src/auth/type';
import { UserService } from 'src/user/user.service';
import { CustomException } from '../../common/custom-exception/custom-exception';
import { UserBlockList } from '../../common/types/user-info.type';

@Injectable()
export class checkExisistingUser implements PipeTransform {
  constructor(
    private readonly userService: UserService,
    private readonly libService: LibService,
  ) {}
  private readonly logger = new Logger(checkExisistingUser.name);
  async transform(req: RequestWithAuth) {
    this.logger.log({ req: req.userId, user: req.body.id });

    if (this.libService.checkIfString(req.body.id))
      throw new CustomException(
        'Id should be an non empty string',
        HttpStatus.BAD_REQUEST,
      );

    const users = await this.userService.findManyUsers(
      [req.userId, req.body.id],
      UserBlockList,
    );

    this.logger.log({ users });

    if (users.length != 2)
      throw new CustomException(
        'One of the user does not exist',
        HttpStatus.NOT_FOUND,
      );

    req.body.userId = req.userId;
    return req.body;
  }
}
