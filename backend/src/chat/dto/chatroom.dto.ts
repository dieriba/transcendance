import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsRightChatTypes } from '../validation-decorator/is-right-group-type.validation';
import { TYPE } from '@prisma/client';
import { Type } from 'class-transformer';
import { isRightRestrictionTypes } from '../validation-decorator/is-right-restrict-type.validation';

export class ChatRoomDto {
  @IsString()
  @IsNotEmpty()
  chatroomName: string;

  @IsArray()
  @ArrayMinSize(1)
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

export class RestrictUser {
  @IsString()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  @isRightRestrictionTypes()
  restriction: string;

  @IsNumber()
  @IsPositive()
  duration: number;
}

export class RestrictedUsersDto {
  chatroomId: string;
  @ValidateNested({ each: true })
  @Type(() => RestrictUser)
  @ArrayMinSize(1)
  restrictedUser: RestrictUser[];
}
