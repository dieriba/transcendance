import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { MESSAGE_TYPES, RESTRICTION, ROLE, TYPE } from '@prisma/client';
import { DAYS, HOURS, MIN } from 'src/common/constant/enum.constant';
import { isValidDuration } from '../validation-decorator/is-valid-duration.validation';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum DURATION_UNIT {
  MINUTES = MIN,
  HOUR = HOURS,
  DAY = DAYS,
}

export class ChatRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomName: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  users: string[];

  @ApiProperty()
  @IsEnum(TYPE)
  @IsNotEmpty()
  type: TYPE;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;
}

export class DmMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  friendId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsEnum(MESSAGE_TYPES)
  messageTypes: MESSAGE_TYPES;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  image: string;

  /*ONLY accept reply if type IS REPLY*/
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  reply: string;
}

export class ChatroomMessageDto {
  @IsString()
  @ApiProperty()
  chatroomId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  image: string;

  @ApiProperty()
  @IsEnum(MESSAGE_TYPES)
  messageTypes: MESSAGE_TYPES;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  userId: string;

  @IsOptional()
  nickname: string;

  /*ONLY accept reply if type IS REPLY*/
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  reply: string;
}

export class JoinChatroomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password: string;
}

export class RestrictedUsersDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  chatroomId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(RESTRICTION)
  restriction: RESTRICTION;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @isValidDuration('restriction')
  duration: number;

  @ApiProperty()
  @IsEnum(DURATION_UNIT)
  durationUnit: DURATION_UNIT;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason: string;

  @IsOptional()
  isChatAdmin: boolean;

  @IsOptional()
  userId: string;

  @IsOptional()
  nickname: string;
}

export class UnrestrictedUsersDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  chatroomId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  isChatAdmin: boolean;

  @IsOptional()
  userId: string;

  @IsOptional()
  nickname: string;
}

export class ChangeUserRole {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsIn([ROLE.CHAT_ADMIN, ROLE.REGULAR_USER])
  role: ROLE;
}

export class ChangeUserRoleDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChangeUserRole)
  users: ChangeUserRole[];

  @ApiProperty()
  @IsString()
  chatroomId: string;

  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  userId: string;
}

export class DieribaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nickname: string;
}

export class ChatroomDataDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  users: string[];

  @ApiProperty()
  @IsString()
  chatroomId: string;

  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  userId: string;
}
