import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsRightChatTypes } from '../validation-decorator/is-right-group-type.validation';
import { RESTRICTION, TYPE } from '@prisma/client';
import { DAYS, HOURS, MIN } from 'src/common/constant/enum.constant';
import { isValidDuration } from '../validation-decorator/is-valid-duration.validation';

export enum DURATION_UNIT {
  MINUTES = MIN,
  HOUR = HOURS,
  DAY = DAYS,
}
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

export class RestrictedUsersDto {
  @IsNotEmpty()
  @IsString()
  chatroomId: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsEnum(RESTRICTION)
  restriction: RESTRICTION;

  @IsInt()
  @IsPositive()
  @isValidDuration('restriction')
  duration: number;

  @IsEnum(DURATION_UNIT)
  durationUnit: DURATION_UNIT;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason: string;

  @IsOptional()
  userId: string;

  @IsOptional()
  nickname: string;
}

export class ChatroomDataDto {
  @IsArray()
  @ArrayMinSize(1)
  users: string[];

  @IsOptional()
  @IsString()
  nickname: string;

  @IsString()
  chatroomId: string;

  @IsOptional()
  @IsString()
  userId: string;
}

export class ChatroomData {
  users: string[];

  nickname: string;

  chatroomId: string;

  userId: string;
}
