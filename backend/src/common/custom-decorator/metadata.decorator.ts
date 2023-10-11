import { SetMetadata } from '@nestjs/common';

export const PublicRoute = () => SetMetadata('isPublic', true);
export const ChatRoute = () => SetMetadata('CHAT', true);
