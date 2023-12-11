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
  WsNotFoundException,
  WsUnauthorizedException,
  WsUserNotFoundException,
} from 'src/common/custom-exception/ws-exception';
import { LibService } from 'src/lib/lib.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IsRestrictedUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly libService: LibService,
    private readonly prismaService: PrismaService,
  ) {}
  private readonly logger = new Logger(IsRestrictedUserGuard.name);
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
      );
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        chatrooms: {
          where: {
            chatroomId,
          },
          select: {
            chatroom: {
              select: {
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
              },
            },
          },
        },
      },
    });

    if (!user) throw new WsUserNotFoundException();

    const { chatrooms } = user;

    if (chatrooms.length === 0)
      throw new WsNotFoundException('Chatroom doest not exist');

    const chatroom = chatrooms[0].chatroom;

    if (chatroom.users.length && chatroom.users[0].user.blockedUsers.length)
      throw new WsUnauthorizedException(
        `${chatroom.users[0].user.nickname} blocked you, so you can't join that group`,
      );

    const localTimeOptions = { hour12: false };

    if (chatroom.restrictedUsers.length === 0) {
      const restrictedUser = chatroom.restrictedUsers[0];
      if (isChat && restrictedUser.restriction === RESTRICTION.MUTED) {
        throw new WsUnauthorizedException(
          `You are muted until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
        );
      } else if (restrictedUser.restriction === RESTRICTION.KICKED)
        throw new WsUnauthorizedException(
          `You are Kicked from that room until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
        );
      else if (restrictedUser.restriction === RESTRICTION.BANNED) {
        throw new WsUnauthorizedException(
          `You are Banned from that room until: ${restrictedUser.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${restrictedUser.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
        );
      }
    }

    return true;
  }
}
