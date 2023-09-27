import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../../validation-decorator/match.decorator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  @Matches('^[a-zA-Z][a-zA-Z0-9_.]*$')
  readonly nickName: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @Match('password', { message: 'Password do not match' })
  readonly confirmPassword: string;
}
