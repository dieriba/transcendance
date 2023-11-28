import { LibService } from 'src/lib/lib.service';
import {
  Injectable,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { RequestWithAuth } from 'src/auth/type';
import { UserService } from 'src/user/user.service';
import { CustomException } from '../../common/custom-exception/custom-exception';
import { UserBlockList } from '../../common/types/user-info.type';
import { Observable } from 'rxjs';

@Injectable()
export class CheckExisistingUser implements NestInterceptor {
  readonly logger = new Logger(CheckExisistingUser.name);
  constructor(
    private readonly userService: UserService,
    private readonly libService: LibService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: RequestWithAuth = context.switchToHttp().getRequest();
    this.logger.log({ req: request.userId, user: request.body.friendId });

    if (this.libService.checkIfString(request.body.friendId))
      throw new CustomException(
        'Id should be an non empty string',
        HttpStatus.BAD_REQUEST,
      );

    const users = await this.userService.findManyUsers(
      [request.userId, request.body.id],
      UserBlockList,
    );

    this.logger.log({ users });

    if (users.length != 2)
      throw new CustomException(
        'One of the user does not exist',
        HttpStatus.NOT_FOUND,
      );

    request.body.userId = request.userId;

    return next.handle();
  }
}
