import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESTRICTION, ROLE } from '@prisma/client';
import { RequestWithAuth } from 'src/auth/type';
import {
  WsBadRequestException,
  WsChatroomNotFoundException,
  WsUnauthorizedException,
  WsUserNotFoundException,
} from 'src/common/custom-exception/ws-exception';
import { LibService } from 'src/lib/lib.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IsRestrictedUserGuardWs implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly libService: LibService,
    private readonly prismaService: PrismaService,
  ) {}
  private readonly logger = new Logger(IsRestrictedUserGuardWs.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: RequestWithAuth = context.switchToWs().getClient();

    const isChat = this.reflector.getAllAndOverride('CHAT', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { chatroomId } = context.switchToWs().getData();
    const { userId } = client;

    if (chatroomId === undefined || this.libService.checkIfString(chatroomId)) {
      throw new WsBadRequestException(
        'chatroomId property must be an non empty string',
        { chatroomId },
      );
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

    if (!user) throw new WsUserNotFoundException({ chatroomId });

    if (!chatroom) throw new WsChatroomNotFoundException({ chatroomId });

    if (chatroom.users.length && chatroom.users[0].user.blockedUsers.length && !me)
      throw new WsUnauthorizedException(
        `${chatroom.users[0].user.nickname} blocked you, so you can't join that group`,
        { chatroomId },
      );

    const localTimeOptions = { hour12: false };

    if (chatroom.restrictedUsers.length) {
      const restrictedUser = chatroom.restrictedUsers[0];
      if (isChat && restrictedUser.restriction === RESTRICTION.MUTED) {
        throw new WsUnauthorizedException(
          `You are muted until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
          { chatroomId },
        );
      } else if (restrictedUser.restriction === RESTRICTION.KICKED)
        throw new WsUnauthorizedException(
          `You are Kicked from that room until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
          { chatroomId },
        );
      else if (restrictedUser.restriction === RESTRICTION.BANNED) {
        throw new WsUnauthorizedException(
          `You are Banned from that room until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
          { chatroomId },
        );
      }
    }

    return true;
  }
}
