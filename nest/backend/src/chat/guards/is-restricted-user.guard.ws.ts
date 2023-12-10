import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESTRICTION } from '@prisma/client';
import { RequestWithAuth } from 'src/auth/type';
import {
  WsBadRequestException,
  WsUnauthorizedException,
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

    const isRestricted = await this.prismaService.restrictedUser.findUnique({
      where: {
        userId_chatroomId: {
          userId,
          chatroomId,
        },
      },
    });

    const now = new Date();
    const localTimeOptions = { hour12: false };

    if (isRestricted && isRestricted.restrictionTimeEnd > now) {
      if (isChat && isRestricted.restriction === RESTRICTION.MUTED) {
        throw new WsUnauthorizedException(
          `You are muted until: ${isRestricted.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${isRestricted.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
        );
      } else if (isRestricted.restriction === RESTRICTION.KICKED)
        throw new WsUnauthorizedException(
          `You are Kicked from that room until: ${isRestricted.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${isRestricted.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
        );
      else if (isRestricted.restriction === RESTRICTION.BANNED) {
        throw new WsUnauthorizedException(
          `You are Banned from that room until: ${isRestricted.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )} ${isRestricted.restrictionTimeEnd.toLocaleTimeString(
            'fr-FR',
            localTimeOptions,
          )}`,
        );
      }
    }

    return true;
  }
}
