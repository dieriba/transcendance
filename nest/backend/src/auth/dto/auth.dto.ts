import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Match } from '../../common/validation-decorator/match.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ERR_MSG_MAXIMUM_NICKNAME_LENGTH,
  ERR_MSG_MAXIMUM_PASSWORD_LENGTH,
  ERR_MSG_MINIMUM_NICKNAME_LENGTH,
  ERR_MSG_MINIMUM_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
  MAX_NICKNAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_NICKNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  REGEX_NICKNAME,
} from 'shared/error.message.constant';

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @MinLength(MIN_NAME_LENGTH)
  readonly lastname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @MinLength(MIN_NAME_LENGTH)
  readonly firstname: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_NICKNAME_LENGTH, { message: ERR_MSG_MINIMUM_NICKNAME_LENGTH })
  @MaxLength(MAX_NICKNAME_LENGTH, { message: ERR_MSG_MAXIMUM_NICKNAME_LENGTH })
  @Matches(REGEX_NICKNAME)
  readonly nickname: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  readonly password: string;

  @ApiProperty()
  @Match('password', { message: 'Password do not match' })
  readonly confirmPassword: string;
}

export class LoginUserDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH, { message: ERR_MSG_MINIMUM_PASSWORD_LENGTH })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: ERR_MSG_MAXIMUM_PASSWORD_LENGTH })
  readonly password: string;

  @IsOptional()
  readonly id: string;

  @IsOptional()
  twoFa: boolean;

  @IsOptional()
  readonly nickname: string;
}
