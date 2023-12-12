import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MIN_NICKNAME_LENGTH,
  ERR_MSG_MINIMUM_NICKNAME_LENGTH,
  MAX_NICKNAME_LENGTH,
  ERR_MSG_MAXIMUM_NICKNAME_LENGTH,
  REGEX_NICKNAME,
} from 'shared/error.message.constant';

export class UserIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class UserInfoUpdateDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_NICKNAME_LENGTH, { message: ERR_MSG_MINIMUM_NICKNAME_LENGTH })
  @MaxLength(MAX_NICKNAME_LENGTH, { message: ERR_MSG_MAXIMUM_NICKNAME_LENGTH })
  @Matches(REGEX_NICKNAME)
  readonly nickname: string;
}
