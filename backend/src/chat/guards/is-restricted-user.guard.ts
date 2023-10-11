import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESTRICTION } from '@prisma/client';
import { RequestWithAuth } from 'src/auth/type';
import { CustomException } from 'src/common/custom-exception/custom-exception';
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
    const request: RequestWithAuth = context.switchToHttp().getRequest();

    const isChat = this.reflector.getAllAndOverride('CHAT', [
      context.getHandler(),
      context.getClass(),
    ]);

    const chatroomId: string = request.body.chatroomId;
    const { userId } = request;
    if (chatroomId === undefined || this.libService.checkIfString(chatroomId)) {
      throw new CustomException(
        'chatroomId property must be an non empty string',
        HttpStatus.BAD_REQUEST,
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

    if (isRestricted && isRestricted.restrictionTimeEnd > now) {
      if (isChat && isRestricted.restriction === RESTRICTION.MUTED) {
        throw new CustomException(
          `You are muted until: ${isRestricted.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )}`,
          HttpStatus.FORBIDDEN,
        );
      } else if (isRestricted.restriction === RESTRICTION.KICKED)
        throw new CustomException(
          `You are Kicked from that room until: ${isRestricted.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )}`,
          HttpStatus.FORBIDDEN,
        );
      else if (isRestricted.restriction === RESTRICTION.BANNED) {
        throw new CustomException(
          `You are Banned from that room until: ${isRestricted.restrictionTimeEnd.toLocaleDateString(
            'fr-FR',
          )}`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return true;
  }
}
