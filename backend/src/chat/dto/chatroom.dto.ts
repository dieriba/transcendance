import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsRightChatTypes } from '../validation-decorator/is-right-group-type.validation';
import { TYPE } from '@prisma/client';

export class ChatRoomDto {
  @IsString()
  @IsNotEmpty()
  chatroomName: string;

  @IsArray()
  users: string[];

  @IsRightChatTypes()
  type: TYPE;

  @IsOptional()
  @IsString()
  @MinLength(8)
  roomPassword: string;
}

export class DmMessageDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;
  @IsString()
  @IsNotEmpty()
  receiverId: string;
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatroomMessageDto {
  senderId: string;
  chatroomId: string;
  content: string;
}

export class JoinChatroomDto {
  @IsString()
  @IsNotEmpty()
  chatroomId: string;

  @IsOptional()
  @IsString()
  roomPassword: string;
}
