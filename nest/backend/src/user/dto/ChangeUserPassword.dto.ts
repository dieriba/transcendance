import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  ERR_MSG_MAXIMUM_PASSWORD_LENGTH,
  ERR_MSG_MINIMUM_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from 'shared/error.message.constant';
import { Match } from 'src/common/validation-decorator/match.decorator';
import { NotMatch } from 'src/common/validation-decorator/not-match.decorator';

export class ChangeUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;
  @ApiProperty()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, { message: ERR_MSG_MINIMUM_PASSWORD_LENGTH })
  @MinLength(MAX_PASSWORD_LENGTH, { message: ERR_MSG_MAXIMUM_PASSWORD_LENGTH })
  @NotMatch('currentPassword', {
    message: 'New password must be different from the old one',
  })
  readonly password: string;

  @ApiProperty()
  @Match('password', { message: 'Password do not match' })
  readonly confirmPassword: string;
}
