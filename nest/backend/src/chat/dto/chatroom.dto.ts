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
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RESTRICTION, ROLE, TYPE } from '@prisma/client';
import { isValidDuration } from '../validation-decorator/is-valid-duration.validation';
import { ApiProperty } from '@nestjs/swagger';
import {
  ERR_MSG_MAXIMUM_CHATROOM_NAME_LENGTH,
  ERR_MSG_MAXIMUM_PASSWORD_LENGTH,
  ERR_MSG_MAXIMUM_REASON_LENGTH,
  ERR_MSG_MAX_MESSAGE_LENGTH,
  ERR_MSG_MINIMUM_CHATROOM_NAME_LENGTH,
  ERR_MSG_MINIMUM_PASSWORD_LENGTH,
  ERR_MSG_MINIMUM_REASON_LENGTH,
  MAX_CHATROOM_NAME_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_REASON_LENGTH,
  MIN_CHATROOM_NAME_LENGTH,
  MIN_MESSAGE_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_REASON_LENGTH,
  REGEX_GROUP_NAME,
} from 'shared/error.message.constant';
import { DAYS, HOURS, MIN } from 'src/common/constant/constant';

export enum DURATION_UNIT {
  MINUTES = MIN,
  HOUR = HOURS,
  DAY = DAYS,
}

export class ChatRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_CHATROOM_NAME_LENGTH, {
    message: ERR_MSG_MINIMUM_CHATROOM_NAME_LENGTH,
  })
  @MaxLength(MAX_CHATROOM_NAME_LENGTH, {
    message: ERR_MSG_MAXIMUM_CHATROOM_NAME_LENGTH,
  })
  @Matches(REGEX_GROUP_NAME)
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
  @MinLength(MIN_PASSWORD_LENGTH, { message: ERR_MSG_MINIMUM_PASSWORD_LENGTH })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: ERR_MSG_MAXIMUM_PASSWORD_LENGTH })
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
  @MinLength(MIN_MESSAGE_LENGTH)
  @MaxLength(MAX_MESSAGE_LENGTH, { message: ERR_MSG_MAX_MESSAGE_LENGTH })
  content: string;
}

export class ChatroomMessageDto {
  @IsString()
  @ApiProperty()
  chatroomId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_MESSAGE_LENGTH)
  @MaxLength(MAX_MESSAGE_LENGTH, { message: ERR_MSG_MAX_MESSAGE_LENGTH })
  content: string;
}

export class JoinChatroomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, { message: ERR_MSG_MINIMUM_PASSWORD_LENGTH })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: ERR_MSG_MAXIMUM_PASSWORD_LENGTH })
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
  @IsString()
  @MinLength(MIN_REASON_LENGTH, { message: ERR_MSG_MINIMUM_REASON_LENGTH })
  @MaxLength(MAX_REASON_LENGTH, { message: ERR_MSG_MAXIMUM_REASON_LENGTH })
  reason: string;

  @IsOptional()
  isChatAdmin: boolean;
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
}

export class ChangeUserRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsIn([ROLE.CHAT_ADMIN, ROLE.REGULAR_USER])
  role: ROLE;

  @ApiProperty()
  @IsString()
  chatroomId: string;
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
}

export class EditChatroomDto {
  @IsString()
  @IsNotEmpty()
  chatroomId: string;

  @ApiProperty()
  @IsEnum(TYPE)
  @IsNotEmpty()
  type: TYPE;

  @IsString()
  @IsOptional()
  @MinLength(MIN_PASSWORD_LENGTH, { message: ERR_MSG_MINIMUM_PASSWORD_LENGTH })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: ERR_MSG_MAXIMUM_PASSWORD_LENGTH })
  password: string;
}

export class ChatroomDataDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  users: string[];

  @ApiProperty()
  @IsString()
  chatroomId: string;
}

export class ChatroomIdWithUserIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;
}

export class ChatroomIdWithUserNicknameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;
}

export class ChatroomIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;
}
