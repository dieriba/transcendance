import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESTRICTION, ROLE } from '@prisma/client';
import { RequestWithAuth } from 'src/auth/type';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { LibService } from 'src/lib/lib.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoomNotFoundException } from '../exception/chatroom-not-found.exception';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { WsUnauthorizedException } from 'src/common/custom-exception/ws-exception';

@Injectable()
export class IsRestrictedUserGuardHttp implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly libService: LibService,
    private readonly prismaService: PrismaService,
  ) {}

  private readonly logger = new Logger(IsRestrictedUserGuardHttp.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithAuth = context.switchToHttp().getRequest();

    const isChat = this.reflector.getAllAndOverride('CHAT', [
      context.getHandler(),
      context.getClass(),
    ]);
    let chatroomId = request.query.chatroomId as string;
    const { userId } = request;
    if (chatroomId === undefined || this.libService.checkIfString(chatroomId)) {
      chatroomId = request.body;

      if (
        chatroomId === undefined ||
        this.libService.checkIfString(chatroomId)
      ) {
        throw new CustomException(
          'chatroomId property must be an non empty string',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const [user, chatroom, me] = await Promise.all([
      this.prismaService.user.findFirst({
        where: {
          id: userId,
        },
      }),
      this.prismaService.chatroom.findFirst({
        where: { id: chatroomId },
        select: {
          users: {
            where: {
              role: ROLE.DIERIBA,
            },
            select: {
              user: {
                select: {
                  nickname: true,
                  blockedUsers: {
                    where: {
                      id: userId,
                    },
                  },
                },
              },
            },
          },
          restrictedUsers: {
            where: {
              userId,
              restrictionTimeEnd: {
                gt: new Date(),
              },
            },
            select: {
              restriction: true,
              restrictionTimeEnd: true,
              restrictionTimeStart: true,
            },
          },
        },
      }),
      await this.prismaService.chatroomUser.findUnique({
        where: { userId_chatroomId: { userId, chatroomId } },
      }),
    ]);

    if (!user) throw new UserNotFoundException();

    if (!chatroom) throw new ChatRoomNotFoundException();

    if (
      chatroom.users.length &&
      chatroom.users[0].user.blockedUsers.length &&
      !me
    )
      throw new WsUnauthorizedException(
        `${chatroom.users[0].user.nickname} blocked you, so you can't join that group`,
        { chatroomId },
      );

    const localTimeOptions = { hour12: false };

    if (chatroom.restrictedUsers.length) {
      const restrictedUser = chatroom.restrictedUsers[0];
      if (isChat && restrictedUser.restriction === RESTRICTION.MUTED) {
        throw new CustomException(
          `You are muted until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
          HttpStatus.FORBIDDEN,
        );
      } else if (restrictedUser.restriction === RESTRICTION.KICKED)
        throw new CustomException(
          `You are Kicked from that room until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
          HttpStatus.FORBIDDEN,
        );
      else if (restrictedUser.restriction === RESTRICTION.BANNED) {
        throw new CustomException(
          `You are Banned from that room until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return true;
  }
}
