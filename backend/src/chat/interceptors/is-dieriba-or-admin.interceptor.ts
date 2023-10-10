import { Observable } from 'rxjs';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { ROLE } from '@prisma/client';
import { ChatroomUserService } from 'src/chatroom-user/chatroom-user.service';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { RestrictUser } from '../dto/chatroom.dto';

@Injectable()
export class IsDieribaOrAdminInterceptor implements NestInterceptor {
  readonly logger = new Logger(IsDieribaOrAdminInterceptor.name);
  constructor(private readonly chatroomUserService: ChatroomUserService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { userId } = request;
    const { chatroomId, restrictedUsers } = request.body;
    this.logger.log({ request: request.body });

    const chatroomUser = await this.chatroomUserService.findChatroomUser(
      chatroomId,
      userId,
    );

    if (!chatroomUser)
      throw new CustomException(
        'You are not part of that group',
        HttpStatus.NOT_FOUND,
      );

    if (
      chatroomUser.role !== ROLE.DIERIBA &&
      chatroomUser.role !== ROLE.CHAT_ADMIN
    ) {
      throw new CustomException('Unauthorized', HttpStatus.BAD_REQUEST);
    }

    const foundChatroomUsers = new Set(
      await this.chatroomUserService.findChatChatroomUsers(
        chatroomId,
        restrictedUsers.map((user: RestrictUser) => user.id),
      ),
    );

    if (foundChatroomUsers.size == 0)
      throw new CustomException(
        'None of the specified user exist',
        HttpStatus.BAD_REQUEST,
      );

    request.body.restrictedUsers = restrictedUsers.filter(
      (user: RestrictUser) => foundChatroomUsers.has(user.id),
    );

    return next.handle();
  }
}
